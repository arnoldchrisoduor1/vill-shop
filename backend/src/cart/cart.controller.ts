import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CartService, GuestCartItem } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';

class AddCartItemDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

class UpdateCartItemDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;
}

class GuestCartItemDto implements GuestCartItem {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

class MergeCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  items: GuestCartItemDto[];
}

@UseGuards(JwtAuthGuard)
@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  addItem(@CurrentUser() user: User, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto.productId, dto.variantId, dto.quantity);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: User,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, dto.quantity);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: User, @Param('id') itemId: string) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Post('merge')
  mergeCart(@CurrentUser() user: User, @Body() dto: MergeCartDto) {
    return this.cartService.mergeGuestCart(user.id, dto.items);
  }
}
