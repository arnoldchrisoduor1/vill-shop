import {
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
