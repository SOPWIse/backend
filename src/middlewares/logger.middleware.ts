import { Injectable, NestMiddleware } from '@nestjs/common';
import { ServerResponse } from 'http';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: ServerResponse, next: () => void) {
    const method = req?.method;
    const url = req?.originalUrl;

    console.log(`[${method}] ${url}`);
    // console.log('=======Request headers========');
    // console.log(JSON.stringify(req?.headers, null, 2) + '\n\n');

    next();
  }
}
