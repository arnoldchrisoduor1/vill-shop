import { BadRequestException, Injectable } from '@nestjs/common';
import { Order, OrderState } from '../database/entities/order.entity';

const TRANSITIONS: Record<OrderState, OrderState[]> = {
  [OrderState.PENDING]: [OrderState.AWAITING_PAYMENT, OrderState.CANCELLED],
  [OrderState.AWAITING_PAYMENT]: [OrderState.PAID, OrderState.CANCELLED],
  [OrderState.PAID]: [OrderState.PROCESSING, OrderState.CANCELLED, OrderState.REFUNDED],
  [OrderState.PROCESSING]: [OrderState.SHIPPED, OrderState.REFUNDED],
  [OrderState.SHIPPED]: [OrderState.DELIVERED],
  [OrderState.DELIVERED]: [],
  [OrderState.CANCELLED]: [],
  [OrderState.REFUNDED]: [],
};

@Injectable()
export class OrderStateService {
  transition(order: Order, newState: OrderState): Order {
    const allowed = TRANSITIONS[order.state] ?? [];
    if (!allowed.includes(newState)) {
      throw new BadRequestException(
        `Cannot transition order from ${order.state} to ${newState}. Allowed: [${allowed.join(', ')}]`,
      );
    }
    order.state = newState;
    return order;
  }

  getAllowedTransitions(state: OrderState): OrderState[] {
    return TRANSITIONS[state] ?? [];
  }
}
