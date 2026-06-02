import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @Get()
  findAll(@Query() filters: FilterProductsDto) {
    return this.productsService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/list')
  findAllAdmin(@Query() filters: FilterProductsDto) {
    return this.productsService.findAll(filters, { includeInactive: true });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('manage/:id')
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Public()
  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('currency') currency: string,
  ) {
    return this.productsService.findBySlug(slug, currency);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.create(dto, files);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.update(id, dto, files);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/featured')
  toggleFeatured(@Param('id') id: string) {
    return this.productsService.toggleFeatured(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/active')
  toggleActive(@Param('id') id: string) {
    return this.productsService.toggleActive(id);
  }
}
