import { NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';

/**
 * Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
 * Generally, Helmet is just a collection of smaller middleware functions that set security-related HTTP headers
 * @param {NestFastifyApplication} app - The application server.
 * @see {@link https://docs.nestjs.com/security/helmet} for further information.
 */
export class HelmetConfig {
  static useHelmet(app: NestFastifyApplication) {
    app.register(fastifyHelmet);
  }
}
