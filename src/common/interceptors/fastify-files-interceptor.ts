import { CallHandler, ExecutionContext, Inject, mixin, NestInterceptor, Optional, Type } from '@nestjs/common';
import FastifyMulter from 'fastify-multer';
import { Multer, Options } from 'multer';
import { Observable } from 'rxjs';

type MulterInstance = any;
export function FastifyFilesInterceptor(
  fieldName: string,
  maxCount?: number,
  localOptions?: Options,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected multer: MulterInstance;

    constructor(
      @Optional()
      @Inject('MULTER_MODULE_OPTIONS')
      options: Multer,
    ) {
      this.multer = (FastifyMulter as any)({ ...options, ...localOptions });
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp();

      await new Promise<void>((resolve, reject) =>
        this.multer.array(fieldName, maxCount)(ctx.getRequest(), ctx.getResponse(), (error: any) => {
          if (error) {
            // const error = transformException(err);
            return reject(error);
          }
          resolve();
        }),
      );

      return next.handle();
    }
  }
  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
}
