import * as argon2 from 'argon2';

import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Login, Register } from '@sopwise/types/auth.types';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@sopwise/modules/user/user.service';
import { PrismaService } from '@sopwise/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(body: Register) {
    const hashedPassword = await argon2.hash(body.password);
    return this.userService.createUser({ ...body, hash: hashedPassword });
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
    const { hash, ...rest } = user;
    return rest;
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
