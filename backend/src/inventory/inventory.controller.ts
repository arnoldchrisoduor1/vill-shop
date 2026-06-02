import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('api/v1/admin/inventory')
  getInventoryList(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.inventoryService.getInventoryList(Number(page), Number(limit));
  }

  @Patch('api/v1/admin/inventory/bulk')
  bulkUpdateStock(
    @Body() body: { updates: { id: string; stock: number }[] },
  ) {
    return this.inventoryService.bulkUpdateStock(body.updates);
  }
}
