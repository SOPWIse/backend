import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

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
    const response: FastifyReply = ctx.getResponse<FastifyReply>();
    const request: FastifyRequest = ctx.getRequest<FastifyRequest>();

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
    console.log('\x1b[31m%s\x1b[0m', '===========Error=========');
    console.log('\x1b[31m%s\x1b[0m', `[STATUS CODE: ${status}]`);

    console.log(
      '\x1b[31m%s\x1b[0m',
      JSON.stringify(errorResponse, null, 2) + '\n\n\n',
    );

    // Use Fastify methods to handle response
    response
      .code(status) // Fastify way to set status code
      .send(errorResponse); // Send the error response
  }
}
