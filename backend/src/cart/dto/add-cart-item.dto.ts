import { IsUUID, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number = 1;
}
