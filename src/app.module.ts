import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { PaginationService } from './common/pagination/pagination.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [AuthModule, UserModule, PrismaModule, ConfigModule.forRoot(), HealthModule],
  controllers: [AppController],
  providers: [
    AppService,
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
