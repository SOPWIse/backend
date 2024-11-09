import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from '../middlewares/logger.middleware';
import { PaginationService } from '../common/pagination/pagination.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot(),
    HealthModule,
    // Rate limiting for all routes
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 500,
      },
    ]),
  ],
  providers: [
    AuthService,
    UserService,
    JwtService,
    PrismaService,
    ConfigService,
    PaginationService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
