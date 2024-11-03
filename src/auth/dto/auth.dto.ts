import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'test@test.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 50, { message: 'Password must be between 4 and 50 characters' })
  @ApiProperty({ example: 'password' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'ASSISTANT' })
  role: Role;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ example: 'sopwise', default: 'sopwise' })
  provider: string = 'sopwise';

  @IsString()
  @IsOptional()
  metaData: string;
}
