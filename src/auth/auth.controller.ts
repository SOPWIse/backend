import {
  Controller,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '@prisma/client';
import { RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() { email, name, password, role }: RegisterDto) {
    return this.authService.register({ email, name, password, role });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: { email: string; password: string }) {
    return this.authService.login(req);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin')
  getAdminData() {
    return 'This is an admin-only route';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR)
  @Post('author')
  getAuthorData() {
    return 'This is an author-only route';
  }
}
