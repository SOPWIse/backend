import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail({}, { message: 'given email is invalid' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'company name' })
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'designation' })
  designation: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'department' })
  department: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'profile_picture_url' })
  profilePicture: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber(null, { message: 'given phone number is invalid' })
  @ApiProperty({ example: 'phone number' })
  phoneNumber: string;

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

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail({}, { message: 'given email is invalid' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 50, { message: 'Password must be between 4 and 50 characters' })
  @ApiProperty({ example: 'password' })
  password: string;
}

export class SSOLoginDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail({}, { message: 'given email is invalid' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'company name' })
  companyName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'designation' })
  designation: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'department' })
  department: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'profile_picture_url' })
  profilePicture: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber(null, { message: 'given phone number is invalid' })
  @ApiProperty({ example: 'phone number' })
  phoneNumber: string;

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

export class PersonalInfoDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'company name', required: true })
  companyName?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'designation', required: true })
  designation?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'department', required: true })
  department?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'country', required: true })
  country?: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber(null, { message: 'given phone number is invalid' })
  @ApiProperty({ example: 'phone number', required: true })
  phoneNumber?: string;
}
