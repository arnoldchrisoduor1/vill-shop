import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../database/entities/category.entity';
import { Product } from '../database/entities/product.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { slug } });
    if (!category) throw new NotFoundException(`Category '${slug}' not found`);
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoryRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Category slug already exists');
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async update(id: string, dto: Partial<CreateCategoryDto>): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    await this.productRepo
      .createQueryBuilder()
      .update(Product)
      .set({ categoryId: null })
      .where('category_id = :id', { id })
      .execute();
    await this.categoryRepo.delete(id);
  }
}
