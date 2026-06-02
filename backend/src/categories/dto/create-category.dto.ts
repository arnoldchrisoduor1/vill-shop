import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
