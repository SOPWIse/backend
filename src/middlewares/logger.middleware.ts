import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: ServerResponse, next: () => void) {
    const method = req?.method;
    const url = req?.originalUrl;

    console.log(`[${method}] ${url}`);
    console.log('=======Request headers========');
    console.log(JSON.stringify(req?.headers, null, 2) + '\n\n');

    next();
  }
}

// PUNB0066200
// 0662000106375875