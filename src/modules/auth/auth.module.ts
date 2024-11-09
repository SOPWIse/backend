import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PaginationModule } from '@sopwise/common/pagination/pagination.module';
import { PaginationService } from '@sopwise/common/pagination/pagination.service';
import { AuthController } from '@sopwise/modules/auth/auth.controller';
import { AuthService } from '@sopwise/modules/auth/auth.service';
import { JwtStrategy } from '@sopwise/modules/auth/auth.strategy';
import { UserModule } from '@sopwise/modules/user/user.module';
import { UserService } from '@sopwise/modules/user/user.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';

@Module({
  providers: [
    PaginationService,
    AuthService,
    JwtService,
    PrismaService,
    PaginationModule,
    UserService,
    ConfigService,
    JwtStrategy,
  ],
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
