import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { randomUUID } from 'crypto';
import { Review } from '../database/entities/review.entity';
import { Order, OrderState } from '../database/entities/order.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private storageService: StorageService,
  ) {}

  async createReview(
    userId: string,
    productId: string,
    dto: CreateReviewDto,
    file?: Express.Multer.File,
  ): Promise<Review> {
    // Check user has purchased the product in a DELIVERED or PAID order
    const purchasedOrder = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.items', 'item')
      .where('o.userId = :userId', { userId })
      .andWhere('item.productId = :productId', { productId })
      .andWhere('o.state IN (:...states)', {
        states: [OrderState.DELIVERED],
      })
      .getOne();

    if (!purchasedOrder) {
      throw new BadRequestException('You can only review products you have purchased');
    }

    // Check if user already reviewed this product
    const existing = await this.reviewRepo.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewRepo.create({
      userId,
      productId,
      rating: dto.rating,
      comment: dto.comment,
    });

    if (file) {
      const key = `reviews/${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
      const url = await this.storageService.uploadFile(key, file.buffer, file.mimetype);
      review.imageKey = key;
      review.imageUrl = url;
    }

    return this.reviewRepo.save(review);
  }

  async getProductReviews(
    productId: string,
    page = 1,
    limit = 10,
  ): Promise<{ items: Review[]; total: number; averageRating: number }> {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { productId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const allRatings = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .where('r.productId = :productId', { productId })
      .getRawOne<{ avg: string }>();

    const averageRating = allRatings?.avg ? Math.round(Number(allRatings.avg) * 10) / 10 : 0;

    return { items, total, averageRating };
  }

  async canUserReview(userId: string, productId: string): Promise<{ canReview: boolean }> {
    const existing = await this.reviewRepo.findOne({ where: { userId, productId } });
    if (existing) return { canReview: false };

    const delivered = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.items', 'item')
      .where('o.userId = :userId', { userId })
      .andWhere('item.productId = :productId', { productId })
      .andWhere('o.state = :state', { state: OrderState.DELIVERED })
      .getOne();

    return { canReview: !!delivered };
  }

  async adminDeleteReview(id: string): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepo.delete(id);
  }
}
