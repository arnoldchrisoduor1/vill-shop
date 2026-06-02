import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User, UserRole } from '../database/entities/user.entity';

class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;
}

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('api/v1/payments/initiate')
  initiate(@CurrentUser() user: User, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePesapal(dto.orderId, user.id);
  }

  @Public()
  @Get('api/v1/payments/simulate')
  @Redirect()
  async simulate(@Query('OrderTrackingId') trackingId: string) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    if (!trackingId) {
      return { url: `${frontendUrl}/checkout` };
    }

    try {
      const { orderId } = await this.paymentsService.completeSimulatedPayment(trackingId);
      return { url: `${frontendUrl}/orders/${orderId}/success` };
    } catch {
      return { url: `${frontendUrl}/checkout?payment=failed` };
    }
  }

  @Public()
  @Get('api/v1/payments/callback')
  @Redirect()
  async callback(@Query('OrderTrackingId') trackingId: string) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    if (!trackingId) {
      return { url: `${frontendUrl}/payment/failed` };
    }

    try {
      if (trackingId.startsWith('sim-')) {
        const { orderId } = await this.paymentsService.completeSimulatedPayment(trackingId);
        return { url: `${frontendUrl}/orders/${orderId}/success` };
      }
      await this.paymentsService.verifyAndUpdatePayment(trackingId);
      return { url: `${frontendUrl}/payment/success?ref=${trackingId}` };
    } catch {
      return { url: `${frontendUrl}/payment/failed?ref=${trackingId}` };
    }
  }

  @Public()
  @Post('api/webhooks/pesapal')
  @HttpCode(HttpStatus.OK)
  async pesapalWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.paymentsService.handleWebhook(payload, headers);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('api/v1/payments/:orderId/refund')
  refund(@Param('orderId') orderId: string) {
    return this.paymentsService.refund(orderId);
  }
}
