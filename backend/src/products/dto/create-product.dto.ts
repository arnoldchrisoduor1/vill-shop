import {
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsOptional,
  IsArray,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from '../../database/entities/product.entity';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(ProductType)
  type!: ProductType;

  @IsString()
  sku!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock!: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  priceKes!: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  digitalFileKey?: string;
}
