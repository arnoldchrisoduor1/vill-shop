import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../database/entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagRepo.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const exists = await this.tagRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Tag slug already exists');
    const tag = this.tagRepo.create(dto);
    return this.tagRepo.save(tag);
  }

  async update(id: string, dto: Partial<CreateTagDto>): Promise<Tag> {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    Object.assign(tag, dto);
    return this.tagRepo.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    await this.tagRepo.delete(id);
  }
}
