import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@Controller('api/v1/features')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Public()
  @Get()
  getAll() {
    return this.featureFlagsService.getAll();
  }

  @Public()
  @Get(':name')
  getFlag(@Param('name') name: string) {
    return this.featureFlagsService.getFlag(name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':name')
  update(
    @Param('name') name: string,
    @Body() dto: { isEnabled?: boolean; value?: Record<string, unknown> },
  ) {
    return this.featureFlagsService.update(name, dto);
  }
}
