import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { randomUUID } from 'crypto';
import { ShopEvent } from '../database/entities/event.entity';
import { StorageService } from '../storage/storage.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(ShopEvent)
    private eventRepo: Repository<ShopEvent>,
    private storageService: StorageService,
  ) {}

  async findAll(onlyPublished = false): Promise<ShopEvent[]> {
    if (!onlyPublished) {
      return this.eventRepo.find({ order: { startsAt: 'ASC' } });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    return this.eventRepo.find({
      where: {
        isPublished: true,
        startsAt: MoreThan(cutoff),
      },
      order: { startsAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<ShopEvent> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findBySlug(slug: string): Promise<ShopEvent> {
    const event = await this.eventRepo.findOne({ where: { slug } });
    if (!event) throw new NotFoundException(`Event '${slug}' not found`);
    return event;
  }

  async findFeatured(limit = 3): Promise<ShopEvent[]> {
    return this.eventRepo.find({
      where: { isPublished: true, isFeatured: true },
      order: { startsAt: 'ASC' },
      take: limit,
    });
  }

  async create(dto: CreateEventDto, file?: Express.Multer.File): Promise<ShopEvent> {
    const event = this.eventRepo.create({
      ...dto,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
    });

    if (file) {
      const key = `events/${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
      const url = await this.storageService.uploadFile(key, file.buffer, file.mimetype);
      event.coverImageKey = key;
      event.coverImageUrl = url;
    }

    return this.eventRepo.save(event);
  }

  async update(
    id: string,
    dto: Partial<CreateEventDto>,
    file?: Express.Multer.File,
  ): Promise<ShopEvent> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    if (dto.startsAt) event.startsAt = new Date(dto.startsAt);
    if (dto.endsAt) event.endsAt = new Date(dto.endsAt);

    const { startsAt: _s, endsAt: _e, ...rest } = dto;
    Object.assign(event, rest);

    if (file) {
      if (event.coverImageKey) {
        await this.storageService.deleteFile(event.coverImageKey);
      }
      const key = `events/${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
      const url = await this.storageService.uploadFile(key, file.buffer, file.mimetype);
      event.coverImageKey = key;
      event.coverImageUrl = url;
    }

    return this.eventRepo.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.eventRepo.softDelete(id);
  }

  async togglePublished(id: string): Promise<ShopEvent> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    event.isPublished = !event.isPublished;
    return this.eventRepo.save(event);
  }

  async toggleFeatured(id: string): Promise<ShopEvent> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    event.isFeatured = !event.isFeatured;
    return this.eventRepo.save(event);
  }
}
