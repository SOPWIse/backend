import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetCurrentUser } from './decorator/current-user.decorator';
import { SopWiseUser } from '@prisma/client';
import { UserService } from './user.service';
import { query } from 'winston';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@GetCurrentUser() user: SopWiseUser) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  getAllUsers(@Query('cursor') cursor?: string | undefined) {
    return this.userService.getAllUser(5, cursor);
  }
}
