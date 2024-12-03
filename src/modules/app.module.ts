import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { LoggerMiddleware } from '@sopwise/middlewares/logger.middleware';
import { AuthModule } from '@sopwise/modules/auth/auth.module';
import { AuthService } from '@sopwise/modules/auth/auth.service';
import { SopUploadService } from '@sopwise/modules/create-sop/sop-upload.service';
import { SopUploadModule } from '@sopwise/modules/create-sop/sop.module';
import { HealthModule } from '@sopwise/modules/health/health.module';
import { UserModule } from '@sopwise/modules/user/user.module';
import { UserService } from '@sopwise/modules/user/user.service';
import { PrismaModule } from '@sopwise/prisma/prisma.module';
import { PrismaService } from '@sopwise/prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot(),
    HealthModule,
    SopUploadModule,
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
    SopUploadService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}