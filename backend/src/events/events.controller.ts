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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get()
  findAll() {
    return this.eventsService.findAll(true);
  }

  @Public()
  @Get('featured')
  findFeatured() {
    return this.eventsService.findFeatured();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  findAllAdmin() {
    return this.eventsService.findAll(false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/:id')
  findByIdAdmin(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.eventsService.create(dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateEventDto>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.eventsService.update(id, dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/published')
  togglePublished(@Param('id') id: string) {
    return this.eventsService.togglePublished(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/featured')
  toggleFeatured(@Param('id') id: string) {
    return this.eventsService.toggleFeatured(id);
  }
}
