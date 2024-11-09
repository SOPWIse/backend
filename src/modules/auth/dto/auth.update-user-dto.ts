import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { RegisterDto } from './auth.dto';
import { Role } from '@prisma/client';

export class UpdateUserDto extends PartialType(RegisterDto) {
  @IsOptional()
  @IsEmail({}, { message: 'given email is invalid' })
  @ApiProperty({ example: 'new_email@test.com', required: false })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'New Name', required: false })
  name?: string;

  @IsOptional()
  @ApiProperty({ example: 'ASSISTANT', required: false })
  @IsEnum(Role, { message: 'given role is incorrect' })
  role?: Role;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '{"key": "value"}', required: false })
  metaData?: string;
}
