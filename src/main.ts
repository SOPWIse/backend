import { AppModule } from '@sopwise/modules/app.module';
import FastifyServerApplication from '@sopwise/fastify-server';

async function bootstrap() {
  const server = new FastifyServerApplication();
  await server.run(AppModule);
}
bootstrap();
