import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../database/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async getLowStockProducts(threshold = 5): Promise<Product[]> {
    return this.productRepo
      .createQueryBuilder('p')
      .where('p.stock <= :threshold', { threshold })
      .andWhere('p.isActive = true')
      .andWhere('p.deletedAt IS NULL')
      .orderBy('p.stock', 'ASC')
      .getMany();
  }

  async bulkUpdateStock(
    updates: { id: string; stock: number }[],
  ): Promise<{ updated: number }> {
    let updated = 0;
    for (const { id, stock } of updates) {
      const result = await this.productRepo.update(id, { stock });
      if (result.affected) updated++;
    }
    return { updated };
  }

  async getInventoryList(
    page = 1,
    limit = 50,
  ): Promise<{ items: Product[]; total: number }> {
    const [items, total] = await this.productRepo.findAndCount({
      where: { isActive: true },
      order: { stock: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        type: true,
        priceKes: true,
        isActive: true,
        isFeatured: true,
      },
    });
    return { items, total };
  }
}
