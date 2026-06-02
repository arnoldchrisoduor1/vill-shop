import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HeroSlidesService } from './hero-slides.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@Controller()
export class HeroSlidesController {
  constructor(private readonly heroSlidesService: HeroSlidesService) {}

  @Public()
  @Get('api/v1/hero-slides')
  findActive() {
    return this.heroSlidesService.findAll(true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('api/v1/admin/hero-slides')
  findAll() {
    return this.heroSlidesService.findAll(false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('api/v1/hero-slides')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateHeroSlideDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.heroSlidesService.create(dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('api/v1/hero-slides/:id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateHeroSlideDto>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.heroSlidesService.update(id, dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('api/v1/hero-slides/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.heroSlidesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('api/v1/hero-slides/reorder')
  reorder(@Body() body: { slides: { id: string; sortOrder: number }[] }) {
    return this.heroSlidesService.reorder(body.slides);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('api/v1/hero-slides/:id/active')
  toggleActive(@Param('id') id: string) {
    return this.heroSlidesService.toggleActive(id);
  }
}
