import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RegisterDto } from '@sopwise/modules/auth/dto/auth.dto';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

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
