import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { HeroSlide } from '../database/entities/hero-slide.entity';
import { StorageService } from '../storage/storage.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';

@Injectable()
export class HeroSlidesService {
  constructor(
    @InjectRepository(HeroSlide)
    private slideRepo: Repository<HeroSlide>,
    private storageService: StorageService,
  ) {}

  private mapSlide(slide: HeroSlide): HeroSlide {
    if (slide.imageUrl) {
      slide.imageUrl =
        this.storageService.resolvePublicUrl(slide.imageUrl) ?? slide.imageUrl;
    }
    return slide;
  }

  async findAll(onlyActive = false): Promise<HeroSlide[]> {
    const where = onlyActive ? { isActive: true } : {};
    const slides = await this.slideRepo.find({ where, order: { sortOrder: 'ASC' } });
    return slides.map((s) => this.mapSlide(s));
  }

  async create(dto: CreateHeroSlideDto, file?: Express.Multer.File): Promise<HeroSlide> {
    const slide = this.slideRepo.create({
      ...dto,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    if (file) {
      const key = `hero-slides/${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
      const url = await this.storageService.uploadFile(key, file.buffer, file.mimetype);
      slide.imageKey = key;
      slide.imageUrl = url;
    }

    return this.slideRepo.save(slide);
  }

  async update(
    id: string,
    dto: Partial<CreateHeroSlideDto>,
    file?: Express.Multer.File,
  ): Promise<HeroSlide> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException('Hero slide not found');

    Object.assign(slide, dto);

    if (file) {
      if (slide.imageKey) {
        await this.storageService.deleteFile(slide.imageKey);
      }
      const key = `hero-slides/${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
      const url = await this.storageService.uploadFile(key, file.buffer, file.mimetype);
      slide.imageKey = key;
      slide.imageUrl = url;
    }

    return this.slideRepo.save(slide);
  }

  async remove(id: string): Promise<void> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException('Hero slide not found');
    if (slide.imageKey) {
      await this.storageService.deleteFile(slide.imageKey).catch(() => null);
    }
    await this.slideRepo.delete(id);
  }

  async reorder(slides: { id: string; sortOrder: number }[]): Promise<void> {
    await Promise.all(
      slides.map(({ id, sortOrder }) =>
        this.slideRepo.update(id, { sortOrder }),
      ),
    );
  }

  async toggleActive(id: string): Promise<HeroSlide> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException('Hero slide not found');
    slide.isActive = !slide.isActive;
    return this.slideRepo.save(slide);
  }
}
