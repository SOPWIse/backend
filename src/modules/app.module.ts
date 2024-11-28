import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { LoggerMiddleware } from '@sopwise/middlewares/logger.middleware';
import { AuthModule } from '@sopwise/modules/auth/auth.module';
import { AuthService } from '@sopwise/modules/auth/auth.service';
import { HealthModule } from '@sopwise/modules/health/health.module';
import { UserModule } from '@sopwise/modules/user/user.module';
import { UserService } from '@sopwise/modules/user/user.service';
import { PrismaModule } from '@sopwise/prisma/prisma.module';
import { PrismaService } from '@sopwise/prisma/prisma.service';
import { ApprovalsService } from './approvals/approvals.service';
import { ApprovalsModule } from './approvals/approvals.module';

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
    ApprovalsModule,
  ],
  providers: [
    AuthService,
    UserService,
    JwtService,
    PrismaService,
    ConfigService,
    PaginationService,
    ApprovalsService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
