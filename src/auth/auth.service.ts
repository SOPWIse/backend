import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Login, Register } from '../types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register({
    email,
    name,
    password,
    role,
    provider,
    metaData,
  }: Register) {
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

  async login({ email, password }: Login) {
    const user = await this.prisma.sopWiseUser.findUnique({
      where: { email },
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const pwMatch = await argon2.verify(user.hash, password);
    if (!pwMatch) {
      throw new ForbiddenException('Password incorrect');
    }
    return this.signToken(user.id, user.email);
  }

  async ssoLogin(ssoData: Register) {
    const user = await this.findOrCreateSsoUser(ssoData);
    if (!user) {
      throw new UnauthorizedException('SSO Login failed');
    }
    return this.signToken(user.id, user.email);
  }

  async logout() {
    return { message: 'Logged out successfully!' };
  }

  async findOrCreateSsoUser(ssoData: Register) {
    const { email } = ssoData;
    let user = await this.prisma.sopWiseUser.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.register(ssoData);
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
