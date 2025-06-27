import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PaginationModule } from '@sopwise/common/pagination/pagination.module';
import { AuthService } from '@sopwise/modules/auth/auth.service';
import { JwtStrategy } from '@sopwise/modules/auth/auth.strategy';
import { UserController } from '@sopwise/modules/user/user.controller';
import { UserService } from '@sopwise/modules/user/user.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';

@Module({
  imports: [PaginationModule],
  providers: [AuthService, JwtService, PrismaService, UserService, ConfigService, JwtStrategy],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
