import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { randomUUID } from 'crypto';
import { Product } from '../database/entities/product.entity';
import { Category } from '../database/entities/category.entity';
import { Tag } from '../database/entities/tag.entity';
import { ProductMedia } from '../database/entities/product-media.entity';
import { ExchangeRate } from '../database/entities/exchange-rate.entity';
import { ProductVariant } from '../database/entities/product-variant.entity';
import { FeatureFlag } from '../database/entities/feature-flag.entity';
import { StorageService } from '../storage/storage.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { convertPrice } from '../common/helpers/money';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(ProductMedia)
    private mediaRepo: Repository<ProductMedia>,
    @InjectRepository(ExchangeRate)
    private exchangeRateRepo: Repository<ExchangeRate>,
    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
    @InjectRepository(FeatureFlag)
    private featureFlagRepo: Repository<FeatureFlag>,
    private dataSource: DataSource,
    private storageService: StorageService,
  ) {}

  private async getExchangeRates(): Promise<Record<string, number>> {
    const rates = await this.exchangeRateRepo.find();
    return rates.reduce(
      (acc, r) => ({ ...acc, [r.currency]: Number(r.rate) }),
      {} as Record<string, number>,
    );
  }

  async findAll(
    filters: FilterProductsDto,
    options?: { includeInactive?: boolean },
  ) {
    const limit = filters.limit ?? 20;
    const currency = filters.currency ?? 'KES';

    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.tags', 'tags')
      .leftJoinAndSelect(
        'p.media',
        'media',
        'media.isPrimary = true',
      )
      .leftJoin('p.reviews', 'reviews')
      .addSelect('COALESCE(AVG(reviews.rating), 0)', 'avgRating')
      .addSelect('COUNT(reviews.id)', 'reviewCount')
      .where('p.deletedAt IS NULL')
      .groupBy('p.id')
      .addGroupBy('category.id')
      .addGroupBy('tags.id')
      .addGroupBy('media.id');

    if (!options?.includeInactive) {
      qb.andWhere('p.isActive = true');
    }

    if (filters.q) {
      qb.andWhere(
        '(p.name % :q OR p.description % :q OR p.name ILIKE :qLike)',
        { q: filters.q, qLike: `%${filters.q}%` },
      ).orderBy('similarity(p.name, :q)', 'DESC');
    }

    if (filters.category) {
      qb.andWhere('category.slug = :category', { category: filters.category });
    }

    if (filters.tags) {
      const tagSlugs = filters.tags.split(',').map((t) => t.trim());
      qb.andWhere('tags.slug IN (:...tagSlugs)', { tagSlugs });
    }

    if (filters.type) {
      qb.andWhere('p.type = :type', { type: filters.type });
    }

    if (filters.minPrice !== undefined) {
      qb.andWhere('p.priceKes >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      qb.andWhere('p.priceKes <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.inStock) {
      qb.andWhere('p.stock > 0');
    }

    if (filters.featured) {
      qb.andWhere('p.isFeatured = true');
    }

    if (filters.cursor) {
      try {
        const decoded = Buffer.from(filters.cursor, 'base64').toString('utf8');
        const [ts, id] = decoded.split('|');
        qb.andWhere('(p.createdAt < :ts OR (p.createdAt = :ts AND p.id < :id))', {
          ts: new Date(ts),
          id,
        });
      } catch {
        // invalid cursor, ignore
      }
    }

    if (!filters.q) {
      switch (filters.sort) {
        case 'price_asc':
          qb.orderBy('p.priceKes', 'ASC');
          break;
        case 'price_desc':
          qb.orderBy('p.priceKes', 'DESC');
          break;
        case 'rating':
          qb.orderBy('avgRating', 'DESC');
          break;
        case 'popular':
          qb.orderBy('reviewCount', 'DESC');
          break;
        default:
          qb.orderBy('p.createdAt', 'DESC');
      }
    }

    qb.take(limit + 1);

    const products = await qb.getMany();

    let rates: Record<string, number> = {};
    if (currency !== 'KES') {
      rates = await this.getExchangeRates();
    }

    const hasMore = products.length > limit;
    const items = hasMore ? products.slice(0, limit) : products;

    const mappedItems = items.map((p) => ({
      ...p,
      priceDisplay:
        currency !== 'KES' ? convertPrice(Number(p.priceKes), currency, rates) : Number(p.priceKes),
      currency,
    }));

    const nextCursor =
      hasMore && items.length > 0
        ? Buffer.from(
            `${items[items.length - 1].createdAt.toISOString()}|${items[items.length - 1].id}`,
          ).toString('base64')
        : null;

    return { items: mappedItems, hasMore, nextCursor };
  }

  async findBySlug(slug: string, currency = 'KES'): Promise<Record<string, unknown>> {
    const product = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.tags', 'tags')
      .leftJoinAndSelect('p.variants', 'variants')
      .leftJoinAndSelect('p.media', 'media')
      .leftJoinAndSelect('p.reviews', 'reviews')
      .leftJoinAndSelect('reviews.user', 'reviewer')
      .where('p.slug = :slug AND p.deletedAt IS NULL', { slug })
      .orderBy('media.sortOrder', 'ASC')
      .getOne();

    if (!product) throw new NotFoundException(`Product '${slug}' not found`);

    const ratings = product.reviews?.map((r) => r.rating) ?? [];
    const averageRating =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    let priceDisplay = Number(product.priceKes);
    if (currency !== 'KES') {
      const rates = await this.getExchangeRates();
      priceDisplay = convertPrice(Number(product.priceKes), currency, rates);
    }

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
      priceDisplay,
      currency,
    };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true, tags: true, media: true, variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto, files: Express.Multer.File[] = []): Promise<Product> {
    if (dto.type === 'digital') {
      const flag = await this.featureFlagRepo.findOne({ where: { name: 'digital_products' } });
      if (!flag?.isEnabled) {
        throw new BadRequestException('Digital products are disabled');
      }
    }

    const slug = this.generateSlug(dto.name);

    const tags = dto.tagIds?.length
      ? await this.tagRepo.find({ where: { id: In(dto.tagIds) } })
      : [];

    const category = dto.categoryId
      ? await this.categoryRepo.findOne({ where: { id: dto.categoryId } })
      : undefined;

    const product = this.productRepo.create({
      ...dto,
      slug,
      tags,
      category: category ?? undefined,
    });

    const saved = await this.productRepo.save(product);

    if (files.length > 0) {
      await this.uploadMedia(saved.id, files);
    }

    return this.productRepo.findOne({
      where: { id: saved.id },
      relations: { category: true, tags: true, media: true, variants: true },
    }) as Promise<Product>;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    files: Express.Multer.File[] = [],
  ): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { tags: true, category: true },
    });

    if (!product) throw new NotFoundException('Product not found');

    const nextType = dto.type ?? product.type;
    if (nextType === 'digital') {
      const flag = await this.featureFlagRepo.findOne({ where: { name: 'digital_products' } });
      if (!flag?.isEnabled) {
        throw new BadRequestException('Digital products are disabled');
      }
    }

    if (dto.tagIds !== undefined) {
      product.tags = dto.tagIds?.length
        ? await this.tagRepo.find({ where: { id: In(dto.tagIds) } })
        : [];
    }

    if (dto.categoryId !== undefined) {
      if (dto.categoryId) {
        const cat = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
        if (cat) product.category = cat;
      } else {
        (product as unknown as Record<string, unknown>).category = null;
      }
    }

    const { tagIds: _t, categoryId: _c, ...rest } = dto;
    Object.assign(product, rest);

    const saved = await this.productRepo.save(product);

    if (files.length > 0) {
      await this.uploadMedia(saved.id, files);
    }

    return this.productRepo.findOne({
      where: { id: saved.id },
      relations: { category: true, tags: true, media: true, variants: true },
    }) as Promise<Product>;
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepo.softDelete(id);
  }

  async toggleFeatured(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    product.isFeatured = !product.isFeatured;
    return this.productRepo.save(product);
  }

  async toggleActive(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    product.isActive = !product.isActive;
    return this.productRepo.save(product);
  }

  private async uploadMedia(productId: string, files: Express.Multer.File[]): Promise<void> {
    const existing = await this.mediaRepo.count({ where: { productId } });
    const mediaItems = await Promise.all(
      files.map(async (file, index) => {
        const key = `products/${productId}/${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
        const url = await this.storageService.uploadFile(key, file.buffer, file.mimetype);
        return this.mediaRepo.create({
          productId,
          key,
          url,
          isPrimary: existing === 0 && index === 0,
          sortOrder: existing + index,
        });
      }),
    );
    await this.mediaRepo.save(mediaItems);
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${base}-${Date.now().toString(36)}`;
  }
}
