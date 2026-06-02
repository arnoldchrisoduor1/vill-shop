import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderState } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { Payment, PaymentStatus } from '../database/entities/payment.entity';
import { Product } from '../database/entities/product.entity';
import { ProductVariant } from '../database/entities/product-variant.entity';
import { Cart } from '../database/entities/cart.entity';
import { ExchangeRate } from '../database/entities/exchange-rate.entity';
import { FeatureFlag } from '../database/entities/feature-flag.entity';
import { StorageService } from '../storage/storage.service';
import { OrderStateService } from './order-state.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { convertPrice, generateOrderNumber } from '../common/helpers/money';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
    @InjectRepository(ExchangeRate)
    private exchangeRateRepo: Repository<ExchangeRate>,
    @InjectRepository(FeatureFlag)
    private featureFlagRepo: Repository<FeatureFlag>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    private orderStateService: OrderStateService,
    private storageService: StorageService,
  ) {}

  private async getRates(): Promise<Record<string, number>> {
    const rates = await this.exchangeRateRepo.find();
    return rates.reduce((acc, r) => ({ ...acc, [r.currency]: Number(r.rate) }), {} as Record<string, number>);
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    const currency = dto.currency ?? 'KES';

    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: { items: { product: true, variant: true } },
    });

    if (!cart || !cart.items?.length) {
      throw new BadRequestException('Cart is empty');
    }

    const taxFlag = await this.featureFlagRepo.findOne({ where: { name: 'tax' } });
    const taxRate = taxFlag?.isEnabled ? Number((taxFlag.value as any)?.rate ?? 0.16) : 0;

    const rates = currency !== 'KES' ? await this.getRates() : {};

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderItems: Partial<OrderItem>[] = [];
      let subtotalKes = 0;

      for (const cartItem of cart.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: cartItem.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) throw new NotFoundException(`Product not found: ${cartItem.productId}`);
        if (!product.isActive) throw new BadRequestException(`Product unavailable: ${product.name}`);

        let priceKes = Number(product.priceKes);
        let variantName: string | null = null;
        const digitalFileKey = product.digitalFileKey;

        if (cartItem.variantId) {
          const variant = await queryRunner.manager.findOne(ProductVariant, {
            where: { id: cartItem.variantId, productId: product.id },
            lock: { mode: 'pessimistic_write' },
          });
          if (!variant) throw new NotFoundException('Variant not found');
          if (variant.stock < cartItem.quantity) {
            throw new BadRequestException(`Insufficient stock for variant: ${variant.name}`);
          }
          variant.stock -= cartItem.quantity;
          await queryRunner.manager.save(ProductVariant, variant);
          priceKes = Number(variant.priceKes);
          variantName = variant.name;
        } else {
          if (product.stock < cartItem.quantity) {
            throw new BadRequestException(`Insufficient stock for: ${product.name}`);
          }
          product.stock -= cartItem.quantity;
          await queryRunner.manager.save(Product, product);
        }

        subtotalKes += priceKes * cartItem.quantity;
        const priceDisplay = currency !== 'KES' ? convertPrice(priceKes, currency, rates) : priceKes;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          variantName: variantName ?? undefined,
          quantity: cartItem.quantity,
          priceKes,
          priceDisplay,
          currency,
          digitalFileKey: digitalFileKey ?? undefined,
        });
      }

      const subtotal = currency !== 'KES' ? convertPrice(subtotalKes, currency, rates) : subtotalKes;
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const total = subtotal + taxAmount;

      const order = queryRunner.manager.create(Order, {
        orderNumber: generateOrderNumber(),
        userId,
        state: OrderState.PENDING,
        subtotal,
        taxAmount,
        total,
        currency,
        shippingAddress: dto.shippingAddress
          ? (dto.shippingAddress as unknown as Record<string, string>)
          : undefined,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      for (const item of orderItems) {
        await queryRunner.manager.save(
          OrderItem,
          queryRunner.manager.create(OrderItem, { ...item, orderId: savedOrder.id }),
        );
      }

      await queryRunner.manager.save(
        Payment,
        queryRunner.manager.create(Payment, {
          orderId: savedOrder.id,
          status: PaymentStatus.PENDING,
          amount: total,
          currency,
        }),
      );

      // Clear cart
      await queryRunner.manager.delete('cart_items', { cartId: cart.id });

      await queryRunner.commitTransaction();

      const fullOrder = await this.findUserOrderById(userId, savedOrder.id);
      this.eventEmitter.emit('order.created', { order: fullOrder, userId });
      return fullOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserOrders(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ items: Order[]; total: number; page: number }> {
    const [items, total] = await this.orderRepo.findAndCount({
      where: { userId },
      relations: { items: true, payment: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page };
  }

  async findUserOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: { product: true }, payment: true, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Access denied');
    return order;
  }

  async generateDownloadUrl(
    userId: string,
    orderId: string,
    itemId: string,
  ): Promise<{ url: string; expiresIn: number }> {
    const order = await this.findUserOrderById(userId, orderId);
    if (order.state !== OrderState.PAID && order.state !== OrderState.DELIVERED) {
      throw new BadRequestException('Order must be paid to access digital downloads');
    }
    const item = order.items?.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Order item not found');
    if (!item.digitalFileKey) throw new BadRequestException('Item is not a digital product');
    const expiresIn = 3600;
    const url = await this.storageService.getSignedUrl(item.digitalFileKey, expiresIn);
    return { url, expiresIn };
  }

  async updateTracking(orderId: string, trackingNumber: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.trackingNumber = trackingNumber;
    return this.orderRepo.save(order);
  }

  async adminFindAll(
    page = 1,
    limit = 20,
    state?: OrderState,
  ): Promise<{ items: Order[]; total: number }> {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.user', 'u')
      .leftJoinAndSelect('o.items', 'i')
      .leftJoinAndSelect('o.payment', 'pmt')
      .orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (state) qb.where('o.state = :state', { state });

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async adminFindById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: { product: true }, payment: true, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async adminTransitionState(orderId: string, newState: OrderState): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    this.orderStateService.transition(order, newState);
    const saved = await this.orderRepo.save(order);
    this.eventEmitter.emit(`order.${newState.toLowerCase()}`, { order: saved });
    return saved;
  }
}
