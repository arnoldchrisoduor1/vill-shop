import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../database/entities/cart.entity';
import { CartItem } from '../database/entities/cart-item.entity';
import { Product } from '../database/entities/product.entity';
import { ProductVariant } from '../database/entities/product-variant.entity';

export interface GuestCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
  ) {}

  private async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: { items: { product: true, variant: true } },
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async getCart(userId: string): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  async addItem(
    userId: string,
    productId: string,
    variantId?: string,
    quantity = 1,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.isActive) throw new BadRequestException('Product is not available');

    let availableStock = product.stock;
    let variant: ProductVariant | null = null;

    if (variantId) {
      variant = await this.variantRepository.findOne({ where: { id: variantId } });
      if (!variant) throw new NotFoundException('Variant not found');
      availableStock = variant.stock;
    }

    const existingItem = cart.items?.find(
      (i) => i.productId === productId && i.variantId === (variantId ?? null),
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > availableStock) {
        throw new BadRequestException(`Only ${availableStock} units available`);
      }
      existingItem.quantity = newQty;
      await this.cartItemRepository.save(existingItem);
    } else {
      if (quantity > availableStock) {
        throw new BadRequestException(`Only ${availableStock} units available`);
      }
      const item = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        variantId: variantId ?? undefined,
        quantity,
      });
      await this.cartItemRepository.save(item);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items?.find((i) => i.id === itemId);

    if (!item) throw new NotFoundException('Cart item not found');

    if (quantity <= 0) {
      await this.cartItemRepository.delete(itemId);
    } else {
      item.quantity = quantity;
      await this.cartItemRepository.save(item);
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items?.find((i) => i.id === itemId);

    if (!item) throw new NotFoundException('Cart item not found');

    await this.cartItemRepository.delete(itemId);
    return this.getCart(userId);
  }

  async mergeGuestCart(userId: string, guestItems: GuestCartItem[]): Promise<Cart> {
    for (const guestItem of guestItems) {
      try {
        await this.addItem(userId, guestItem.productId, guestItem.variantId, guestItem.quantity);
      } catch {
        // Skip items that fail to add
      }
    }
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (cart) {
      await this.cartItemRepository.delete({ cartId: cart.id });
    }
  }
}
