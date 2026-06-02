import { BadRequestException } from '@nestjs/common';
import { OrderStateService } from './order-state.service';
import { Order, OrderState } from '../database/entities/order.entity';

function makeOrder(state: OrderState): Order {
  return { id: 'order-id', state } as Order;
}

describe('OrderStateService', () => {
  let service: OrderStateService;

  beforeEach(() => {
    service = new OrderStateService();
  });

  describe('valid transitions', () => {
    it('should transition PENDING → AWAITING_PAYMENT', () => {
      const order = makeOrder(OrderState.PENDING);
      const result = service.transition(order, OrderState.AWAITING_PAYMENT);
      expect(result.state).toBe(OrderState.AWAITING_PAYMENT);
    });

    it('should transition PAID → PROCESSING', () => {
      const order = makeOrder(OrderState.PAID);
      const result = service.transition(order, OrderState.PROCESSING);
      expect(result.state).toBe(OrderState.PROCESSING);
    });

    it('should transition PROCESSING → SHIPPED', () => {
      const order = makeOrder(OrderState.PROCESSING);
      const result = service.transition(order, OrderState.SHIPPED);
      expect(result.state).toBe(OrderState.SHIPPED);
    });

    it('should transition SHIPPED → DELIVERED', () => {
      const order = makeOrder(OrderState.SHIPPED);
      const result = service.transition(order, OrderState.DELIVERED);
      expect(result.state).toBe(OrderState.DELIVERED);
    });

    it('should transition AWAITING_PAYMENT → PAID', () => {
      const order = makeOrder(OrderState.AWAITING_PAYMENT);
      const result = service.transition(order, OrderState.PAID);
      expect(result.state).toBe(OrderState.PAID);
    });

    it('should transition PAID → CANCELLED', () => {
      const order = makeOrder(OrderState.PAID);
      const result = service.transition(order, OrderState.CANCELLED);
      expect(result.state).toBe(OrderState.CANCELLED);
    });
  });

  describe('invalid transitions', () => {
    it('should throw BadRequestException for DELIVERED → SHIPPED', () => {
      const order = makeOrder(OrderState.DELIVERED);
      expect(() => service.transition(order, OrderState.SHIPPED)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for CANCELLED → PAID', () => {
      const order = makeOrder(OrderState.CANCELLED);
      expect(() => service.transition(order, OrderState.PAID)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for REFUNDED → PROCESSING', () => {
      const order = makeOrder(OrderState.REFUNDED);
      expect(() => service.transition(order, OrderState.PROCESSING)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for PENDING → SHIPPED', () => {
      const order = makeOrder(OrderState.PENDING);
      expect(() => service.transition(order, OrderState.SHIPPED)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllowedTransitions', () => {
    it('should return correct transitions for PENDING', () => {
      const allowed = service.getAllowedTransitions(OrderState.PENDING);
      expect(allowed).toContain(OrderState.AWAITING_PAYMENT);
      expect(allowed).toContain(OrderState.CANCELLED);
    });

    it('should return empty array for DELIVERED', () => {
      const allowed = service.getAllowedTransitions(OrderState.DELIVERED);
      expect(allowed).toHaveLength(0);
    });
  });
});
