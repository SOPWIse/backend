import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/auth.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  imports: [PaginationModule],
  providers: [
    AuthService,
    JwtService,
    PrismaService,
    UserService,
    ConfigService,
    JwtStrategy,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
