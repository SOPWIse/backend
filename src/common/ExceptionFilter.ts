import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  error?: string;
  details?: string | string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal Server Error',
    };

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        ...errorResponse,
        message: exception.message,
        error:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).error || exception.message,
        details:
          typeof exceptionResponse === 'object' &&
          exceptionResponse.hasOwnProperty('message')
            ? (exceptionResponse as any).message
            : null,
      };
    }

    response.status(status).send(errorResponse);
  }
}
