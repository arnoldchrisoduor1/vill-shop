import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RAW_RESPONSE_KEY } from '../decorators/raw-response.decorator';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const isRaw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isRaw) {
      return next.handle() as unknown as Observable<ApiResponse<T>>;
    }

    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: (data as Record<string, unknown>)?.['message'] as string || 'OK',
        data: (data as Record<string, unknown>)?.['message'] !== undefined
          ? (({ message: _m, ...rest }) => Object.keys(rest).length ? rest : null)(data as Record<string, unknown>)
          : data,
        code: response.statusCode,
      })),
    );
  }
}
