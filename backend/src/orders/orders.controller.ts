import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderState } from '../database/entities/order.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../database/entities/user.entity';

class TransitionStateDto {
  @IsEnum(OrderState)
  state!: OrderState;
}

class UpdateTrackingDto {
  @IsString()
  @IsNotEmpty()
  trackingNumber!: string;
}

@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findMyOrders(
    @CurrentUser() user: User,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.ordersService.findUserOrders(user.id, Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('state') state?: OrderState,
  ) {
    return this.ordersService.adminFindAll(Number(page), Number(limit), state);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/:id')
  adminFindOne(@Param('id') id: string) {
    return this.ordersService.adminFindById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.ordersService.findUserOrderById(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  createOrder(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/items/:itemId/download')
  generateDownload(
    @CurrentUser() user: User,
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.ordersService.generateDownloadUrl(user.id, orderId, itemId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/state')
  transitionState(@Param('id') id: string, @Body() dto: TransitionStateDto) {
    return this.ordersService.adminTransitionState(id, dto.state);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/tracking')
  updateTracking(@Param('id') id: string, @Body() dto: UpdateTrackingDto) {
    return this.ordersService.updateTracking(id, dto.trackingNumber);
  }
}
