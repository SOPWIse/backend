import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  error?: string;
  details?: string | string[];
  errors?: any;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: FastifyReply = ctx.getResponse<FastifyReply>();
    const request: FastifyRequest = ctx.getRequest<FastifyRequest>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal Server Error',
    };

    // Zod validation errors
    if (exception instanceof ZodError) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.message = 'Validation failed';
      errorResponse.errors = exception.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      return response.code(errorResponse.statusCode).send(errorResponse);
    }

    // Prisma errors
    if (exception instanceof PrismaClientKnownRequestError) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.message = 'Database request error';
      errorResponse.error = exception.code;
      errorResponse.details = exception.message;
    } else if (exception instanceof PrismaClientValidationError) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.message = 'Prisma validation error';
      errorResponse.details = exception.message;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse.message = 'Unknown database error';
      errorResponse.details = exception.message;
    } else if (exception instanceof PrismaClientInitializationError) {
      errorResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      errorResponse.message = 'Database initialization error';
      errorResponse.details = exception.message;
    } else if (exception instanceof PrismaClientRustPanicError) {
      errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse.message = 'Database panic error';
      errorResponse.details = 'The database engine crashed.';
    }

    // HTTP exceptions
    else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        ...errorResponse,
        statusCode: exception.getStatus(),
        message: exception.message,
        error:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).error || exception.message,
        details:
          typeof exceptionResponse === 'object' && exceptionResponse.hasOwnProperty('message')
            ? (exceptionResponse as any).message
            : undefined,
      };
    }

    // Generic JS Error handling
    else if (exception instanceof Error) {
      errorResponse.message = exception.message;
      errorResponse.details = exception.stack;
    }

    console.log('\x1b[31m%s\x1b[0m', '===========Error=========');
    console.log('\x1b[31m%s\x1b[0m', `[STATUS CODE: ${errorResponse.statusCode}]`);
    console.log('\x1b[31m%s\x1b[0m', JSON.stringify(errorResponse, null, 2));

    response.code(errorResponse.statusCode).send(errorResponse);
  }
}
