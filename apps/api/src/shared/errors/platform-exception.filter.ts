import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';

import { resolveRequestId } from '../helpers/request.helpers';
import type { PlatformHttpRequest } from '../interfaces/request-context.interface';

@Catch()
export class PlatformExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse();
    const request = http.getRequest<PlatformHttpRequest>();
    const requestId = resolveRequestId(request);

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error', error: 'InternalServerError' };

    const payload =
      typeof responseBody === 'string'
        ? { message: responseBody }
        : (responseBody as Record<string, unknown>);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.originalUrl ?? request?.url ?? '',
      requestId,
      ...payload,
    });
  }
}
