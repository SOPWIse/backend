import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthService } from '@sopwise/modules/auth/auth.service';
import { LoginDto, RegisterDto } from '@sopwise/modules/auth/dto/auth.dto';
import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { Roles } from '@sopwise/roles/roles.decorator';
import { RolesGuard } from '@sopwise/roles/roles.guard';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register User' })
  async register(@Body() { email, name, password, role }: RegisterDto) {
    return this.authService.register({ email, name, password, role });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  async login(@Body() req: LoginDto) {
    return this.authService.login(req);
  }

  @Post('sso-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SSO Login' })
  async ssoLogin(@Body() ssoData: RegisterDto) {
    return this.authService.ssoLogin(ssoData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin')
  @ApiOperation({ summary: 'TEST' })
  getAdminData() {
    return 'This is an admin-only route';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR)
  @Post('author')
  @ApiOperation({ summary: 'TEST' })
  getAuthorData() {
    return 'This is an author-only route';
  }
}
