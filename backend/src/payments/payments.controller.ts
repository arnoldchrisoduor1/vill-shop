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
import { RawResponse } from '../common/decorators/raw-response.decorator';
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

  @UseGuards(JwtAuthGuard)
  @Get('api/v1/payments/status/:trackingId')
  status(@Param('trackingId') trackingId: string) {
    return this.paymentsService.getTransactionStatus(trackingId);
  }

  // ----- Pesapal IPN (server-to-server payment status change) -----
  // Pesapal calls this URL (registered as GET) whenever a payment status
  // changes. It MUST reply with the exact JSON shape below (raw, unwrapped).
  @Public()
  @RawResponse()
  @Get('api/pesapal/ipn')
  @HttpCode(HttpStatus.OK)
  async pesapalIpnGet(
    @Query('OrderTrackingId') orderTrackingId: string,
    @Query('OrderNotificationType') orderNotificationType: string,
    @Query('OrderMerchantReference') orderMerchantReference: string,
  ) {
    await this.paymentsService.handleWebhook(
      { OrderTrackingId: orderTrackingId, OrderNotificationType: orderNotificationType, OrderMerchantReference: orderMerchantReference },
      {},
    );
    return {
      orderNotificationType,
      orderTrackingId,
      orderMerchantReference,
      status: 200,
    };
  }

  @Public()
  @RawResponse()
  @Post('api/pesapal/ipn')
  @HttpCode(HttpStatus.OK)
  async pesapalIpnPost(
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    const orderTrackingId = (payload.OrderTrackingId ?? payload.orderTrackingId) as string;
    const orderNotificationType = (payload.OrderNotificationType ?? payload.orderNotificationType) as string;
    const orderMerchantReference = (payload.OrderMerchantReference ?? payload.orderMerchantReference) as string;
    await this.paymentsService.handleWebhook(payload, headers);
    return {
      orderNotificationType,
      orderTrackingId,
      orderMerchantReference,
      status: 200,
    };
  }

  // ----- Pesapal callback (browser redirect after the user pays) -----
  @Public()
  @Get('api/pesapal/callback')
  @Redirect()
  async pesapalCallback(@Query('OrderTrackingId') trackingId: string) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    if (!trackingId) {
      return { url: `${frontendUrl}/account/orders?payment=failed` };
    }

    try {
      const { orderId, paymentStatus } =
        await this.paymentsService.getTransactionStatus(trackingId);
      if (paymentStatus === 'COMPLETED' && orderId) {
        return { url: `${frontendUrl}/orders/${orderId}/success` };
      }
      if (orderId) {
        // Payment still processing (e.g. M-Pesa STK). IPN will finalize it.
        return { url: `${frontendUrl}/account/orders/${orderId}?payment=pending` };
      }
      return { url: `${frontendUrl}/account/orders?payment=pending` };
    } catch {
      return { url: `${frontendUrl}/account/orders?payment=failed` };
    }
  }

  // ----- Simulated payment (local dev only, when PESAPAL_SIMULATE=true) -----
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

  // ----- Legacy callback / webhook aliases (kept for backwards compat) -----
  @Public()
  @Get('api/v1/payments/callback')
  @Redirect()
  async callback(@Query('OrderTrackingId') trackingId: string) {
    return this.pesapalCallback(trackingId);
  }

  @Public()
  @RawResponse()
  @Post('api/webhooks/pesapal')
  @HttpCode(HttpStatus.OK)
  async pesapalWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.pesapalIpnPost(payload, headers);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('api/v1/payments/:orderId/refund')
  refund(@Param('orderId') orderId: string) {
    return this.paymentsService.refund(orderId);
  }
}
