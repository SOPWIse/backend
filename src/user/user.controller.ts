import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetCurrentUser } from './decorator/current-user.decorator';

@Controller('user')
export class UserController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@GetCurrentUser() user: any) {
    // `user` here is the authenticated user's data from JWT
    return user;
  }
}
