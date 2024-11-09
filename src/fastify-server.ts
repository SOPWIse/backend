import { DynamicModule, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HelmetConfig } from './config/security/helmet.config';
import { CsrfProtectionConfig } from './config/security/csrf-protection.config';
import { CompressionConfig } from './config/compression/compression.config';
import { SwaggerConfig } from './config/swagger.config.ts/swagger.config';
import { useContainer } from 'class-validator';
import { contentParser } from 'fastify-multer';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

export default class FastifyServerApplication {
  private API_DEFAULT_PORT = '3000';
  public app: NestFastifyApplication;

  protected async configureServices(appModule: unknown) {
    this.app.enableCors();
    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { exposeUnsetFields: false },
      }),
    );

    HelmetConfig.useHelmet(this.app);
    await CsrfProtectionConfig.useCsrf(this.app);
    await CompressionConfig.useCompression(this.app, 'brotli');
    SwaggerConfig.useSwagger(this.app);
    useContainer(this.app.select(appModule as DynamicModule), {
      fallbackOnErrors: true,
    });
    await this.app.register(contentParser);
  }

  public async run(appModule: unknown): Promise<void> {
    this.app = await NestFactory.create<NestFastifyApplication>(
      appModule,
      new FastifyAdapter(),
      {
        rawBody: true,
      },
    );
    const configService = this.app.get(ConfigService);
    const PORT = configService.get('PORT');
    await this.configureServices(appModule);
    // await this.app.listen({
    //   port: parseInt(PORT || this.API_DEFAULT_PORT),
    //   host: '0.0.0.0',
    // });
    /**
     * Uncomment when testing locally
     * */
    await this.app.listen(PORT);
    console.info(`⚛️ SOPWISE-API is running on: ${await this.app.getUrl()}`);
  }
}
