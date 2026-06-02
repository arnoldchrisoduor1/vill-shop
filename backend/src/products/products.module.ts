import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../database/entities/product.entity';
import { Category } from '../database/entities/category.entity';
import { Tag } from '../database/entities/tag.entity';
import { ProductMedia } from '../database/entities/product-media.entity';
import { ProductVariant } from '../database/entities/product-variant.entity';
import { ExchangeRate } from '../database/entities/exchange-rate.entity';
import { FeatureFlag } from '../database/entities/feature-flag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Tag, ProductMedia, ProductVariant, ExchangeRate, FeatureFlag])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
