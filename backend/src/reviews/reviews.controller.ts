import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../database/entities/user.entity';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('api/v1/products/:productId/reviews')
  getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.getProductReviews(productId, Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/v1/products/:productId/reviews/can-review')
  canReview(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.reviewsService.canUserReview(user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('api/v1/products/:productId/reviews')
  @UseInterceptors(FileInterceptor('image'))
  createReview(
    @CurrentUser() user: User,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.reviewsService.createReview(user.id, productId, dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('api/v1/admin/reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  adminDelete(@Param('id') id: string) {
    return this.reviewsService.adminDeleteReview(id);
  }
}
