import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'test@test.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 30, { message: 'Password must be between 4 and 20 characters' })
  password: string;

  @IsString()
  @IsNotEmpty()
  role: Role;
}
