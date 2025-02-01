import FastifyServerApplication from '@sopwise/fastify-server';
import { AppModule } from '@sopwise/modules/app.module';

async function bootstrap() {
  const server = new FastifyServerApplication();
  await server.run(AppModule);
}
bootstrap();
// Empty
