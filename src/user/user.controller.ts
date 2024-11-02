import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetCurrentUser } from './decorator/current-user.decorator';
import { SopWiseUser } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@GetCurrentUser() user: SopWiseUser) {
    return user;
  }
}
