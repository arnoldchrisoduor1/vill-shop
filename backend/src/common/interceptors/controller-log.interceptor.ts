import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  CrudAction,
  resolveCrudAction,
} from '../utils/resolve-crud-action.util';

const ACTION_WIDTH = 6;
const STATUS_WIDTH = 3;
const DURATION_WIDTH = 6;

@Injectable()
export class ControllerLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const path = req.originalUrl?.split('?')[0] ?? req.url.split('?')[0];

    if (path.startsWith('/health') || path.startsWith('/api/docs')) {
      return next.handle();
    }

    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const method = req.method.toUpperCase();
    const action = resolveCrudAction(method, handler);
    const started = Date.now();
    const user = req.user;
    const userLabel = user?.email ?? user?.id ?? 'anonymous';
    const requestId = req.requestId?.slice(0, 8) ?? '--------';
    const target = `${controller}.${handler}`;

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        this.emit(action, target, method, path, res.statusCode, Date.now() - started, userLabel, requestId);
      }),
      catchError((err: { status?: number; statusCode?: number }) => {
        const status = err?.status ?? err?.statusCode ?? 500;
        this.emit(action, target, method, path, status, Date.now() - started, userLabel, requestId, true);
        return throwError(() => err);
      }),
    );
  }

  private emit(
    action: CrudAction,
    target: string,
    method: string,
    path: string,
    status: number,
    durationMs: number,
    userLabel: string,
    requestId: string,
    failed = false,
  ): void {
    const outcome = failed ? 'FAIL' : action.padEnd(ACTION_WIDTH);
    const statusLabel = String(status).padStart(STATUS_WIDTH);
    const durationLabel = `${durationMs}ms`.padStart(DURATION_WIDTH);
    const route = `${method} ${path}`;

    const line = [
      `[${outcome}]`,
      target.padEnd(36),
      route.padEnd(44),
      statusLabel,
      durationLabel,
      `user:${userLabel}`,
      `req:${requestId}`,
    ].join('  ');

    if (failed) {
      if (status >= 500) this.logger.error(line);
      else this.logger.warn(line);
      return;
    }

    this.logger.log(line);
  }
}
