import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface RequestLike {
  url?: string;
  originalUrl?: string;
}

@Catch()
export class PlatformExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse();
    const request = http.getRequest<RequestLike>();

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
      ...payload,
    });
  }
}

