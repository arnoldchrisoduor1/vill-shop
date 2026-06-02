import { IsString, IsOptional, IsObject } from 'class-validator';

export class ShippingAddressDto {
  name!: string;
  address!: string;
  city!: string;
  phone!: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsObject()
  shippingAddress?: ShippingAddressDto;
}
