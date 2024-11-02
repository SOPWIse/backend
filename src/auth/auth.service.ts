import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

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
  ) {
    const hashedPassword = await argon2.hash(password);
    return this.userService.createUser(email, name, hashedPassword, role);
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

  async logout() {
    return { message: 'Logged out successfully!' };
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
