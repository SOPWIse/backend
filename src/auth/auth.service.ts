import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(
    email: string,
    name: string,
    password: string,
    role: Role = Role.ASSISTANT,
    provider?: string,
    metaData?: string,
  ) {
    const hashedPassword = await argon2.hash(password);
    return this.userService.createUser(
      email,
      name,
      hashedPassword,
      role,
      provider,
      metaData,
    );
  }

  async login(dto: { email: string; password: string }) {
    console.log('dto', dto);
    const user = await this.prisma.sopWiseUser.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const pwMatch = await argon2.verify(user.hash, dto.password);
    if (!pwMatch) {
      throw new ForbiddenException('Password incorrect');
    }
    return this.signToken(user.id, user.email);
  }

  async ssoLogin(ssoData: RegisterDto) {
    const user = await this.findOrCreateSsoUser(ssoData);
    if (!user) {
      throw new UnauthorizedException('SSO Login failed');
    }
    return this.signToken(user.id, user.email);
  }

  async logout() {
    return { message: 'Logged out successfully!' };
  }

  async findOrCreateSsoUser(ssoData: RegisterDto) {
    const { email, name, role, password, provider, metaData } = ssoData;
    let user = await this.prisma.sopWiseUser.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.register(
        email,
        name,
        password,
        role,
        provider,
        metaData,
      );
    }

    return user;
  }

  private async signToken(
    userId: string | number,
    email: string,
  ): Promise<{
    access_token: string;
  }> {
    const payload = {
      sub: userId,
      email,
    };

    const token = this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get<string>('SECRET'),
    });

    return token.then((access_token) => ({ access_token }));
  }
}
