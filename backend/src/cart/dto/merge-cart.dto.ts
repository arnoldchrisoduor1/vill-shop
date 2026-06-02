import { IsArray, IsNumber, IsOptional, IsPositive, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GuestItemDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity!: number;
}

export class MergeCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestItemDto)
  items!: GuestItemDto[];
}
