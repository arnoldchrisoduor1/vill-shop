import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHeroSlideDto {
  @IsString()
  headline!: string;

  @IsOptional()
  @IsString()
  subtext?: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  ctaUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
