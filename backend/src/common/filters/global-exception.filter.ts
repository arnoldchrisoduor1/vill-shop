import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res['message'] as string) || message;
        if (Array.isArray(res['message'])) {
          message = 'Validation failed';
          errors = res['message'];
        }
      }
    } else if (exception instanceof QueryFailedError) {
      const err = exception as QueryFailedError & { code?: string };
      if (err.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists';
      } else if (err.code === '23503') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced record does not exist';
      } else {
        this.logger.error('Database error', exception);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      message = process.env.NODE_ENV === 'development' ? exception.message : 'Internal server error';
    } else {
      this.logger.error('Unknown exception', exception);
    }

    response.status(status).json({
      success: false,
      message,
      data: null,
      errors,
      code: status,
    });
  }
}
