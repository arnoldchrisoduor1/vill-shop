import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('api/v1/admin/reports')
  getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('currency') currency = 'KES',
  ) {
    return this.reportsService.getRevenueReport(startDate, endDate, currency);
  }

  @Get('api/v1/admin/reports/export')
  async exportCsv(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('currency') currency = 'KES',
    @Res() res: Response,
  ) {
    const data = await this.reportsService.getRevenueReport(startDate, endDate, currency);
    const csv = this.reportsService.exportCsv(
      data as unknown as Record<string, unknown>[],
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="revenue-report-${startDate}-${endDate}.csv"`,
    );
    res.send(csv);
  }
}
