import { DynamicModule, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { CompressionConfig } from '@sopwise/config/compression/compression.config';
import { CsrfProtectionConfig } from '@sopwise/config/security/csrf-protection.config';
import { HelmetConfig } from '@sopwise/config/security/helmet.config';
import { SwaggerConfig } from '@sopwise/config/swagger.config.ts/swagger.config';
import { useContainer } from 'class-validator';
import * as multipart from 'fastify-multipart';

export default class FastifyServerApplication {
  private API_DEFAULT_PORT = '3000';
  private fastifyAdapter: FastifyAdapter; // Explicitly use FastifyAdapter
  public app: NestFastifyApplication;

  constructor() {
    this.fastifyAdapter = new FastifyAdapter(); // Initialize FastifyAdapter directly
  }

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

    // Register fastify-multipart plugin directly on the Fastify instance
    const fastifyInstance = this.fastifyAdapter.getInstance();
    await fastifyInstance.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
      },
    });

    console.info('fastify-multipart plugin registered successfully.');
  }

  public async run(appModule: unknown): Promise<void> {
    this.app = await NestFactory.create<NestFastifyApplication>(
      appModule,
      this.fastifyAdapter,
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
