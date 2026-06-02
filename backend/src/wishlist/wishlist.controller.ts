import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { IsArray, IsUUID } from 'class-validator';

class AddProductDto {
  @IsUUID()
  productId!: string;
}

class SyncWishlistDto {
  @IsArray()
  @IsUUID('all', { each: true })
  productIds!: string[];
}

@UseGuards(JwtAuthGuard)
@Controller('api/v1/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser() user: User) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post('products')
  addProduct(@CurrentUser() user: User, @Body() dto: AddProductDto) {
    return this.wishlistService.addProduct(user.id, dto.productId);
  }

  @Delete('products/:productId')
  removeProduct(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.wishlistService.removeProduct(user.id, productId);
  }

  @Post('sync')
  syncWishlist(@CurrentUser() user: User, @Body() dto: SyncWishlistDto) {
    return this.wishlistService.syncWishlist(user.id, dto.productIds);
  }
}
