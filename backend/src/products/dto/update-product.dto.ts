import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductType } from '../../database/entities/product.entity';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceKes?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  digitalFileKey?: string;
}
