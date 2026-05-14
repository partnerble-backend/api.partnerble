import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const res = exception.getResponse();

    const message =
      typeof res === 'object' && res !== null && 'message' in res
        ? (res as Record<string, unknown>).message
        : res;

    const error =
      typeof res === 'object' && res !== null && 'error' in res
        ? (res as Record<string, unknown>).error
        : exception.message;

    response.status(status).json({ statusCode: status, message, error });
  }
}
