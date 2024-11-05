import { Module } from '@nestjs/common';
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
import { PaginationService } from './common/pagination/pagination.service';

@Module({
  imports: [AuthModule, UserModule, PrismaModule, ConfigModule.forRoot()],
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
export class AppModule {}

/**
  @Module({
  imports: [ Other modules ],
  controllers: [ Controllers ],
  providers: [ Services/Providers ],
  exports: [ Exported providers ],
})
export class SomeModule {}
*/
