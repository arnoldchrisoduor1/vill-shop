import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Public()
  @Get('api/v1/stats')
  getCounts() {
    return this.statsService.getCounts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('api/v1/admin/dashboard')
  getDashboard() {
    return this.statsService.getAdminDashboard();
  }
}
