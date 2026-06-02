import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSlidesController } from './hero-slides.controller';
import { HeroSlidesService } from './hero-slides.service';
import { HeroSlide } from '../database/entities/hero-slide.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([HeroSlide]), StorageModule],
  controllers: [HeroSlidesController],
  providers: [HeroSlidesService],
  exports: [HeroSlidesService],
})
export class HeroSlidesModule {}
