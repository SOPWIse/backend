import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail({}, { message: 'given email is invalid' })
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
  @IsEnum(Role, { message: 'given role is incorrect' })
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
