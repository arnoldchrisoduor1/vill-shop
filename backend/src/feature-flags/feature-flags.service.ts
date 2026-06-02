import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from '../database/entities/feature-flag.entity';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectRepository(FeatureFlag)
    private flagRepo: Repository<FeatureFlag>,
  ) {}

  async getAll(): Promise<FeatureFlag[]> {
    return this.flagRepo.find();
  }

  async getFlag(name: string): Promise<FeatureFlag> {
    const flag = await this.flagRepo.findOne({ where: { name } });
    if (!flag) throw new NotFoundException(`Feature flag '${name}' not found`);
    return flag;
  }

  async toggle(name: string): Promise<FeatureFlag> {
    const flag = await this.getFlag(name);
    flag.isEnabled = !flag.isEnabled;
    return this.flagRepo.save(flag);
  }

  async update(
    name: string,
    dto: { isEnabled?: boolean; value?: Record<string, unknown> },
  ): Promise<FeatureFlag> {
    const flag = await this.getFlag(name);
    if (dto.isEnabled !== undefined) flag.isEnabled = dto.isEnabled;
    if (dto.value !== undefined) flag.value = dto.value;
    return this.flagRepo.save(flag);
  }
}
