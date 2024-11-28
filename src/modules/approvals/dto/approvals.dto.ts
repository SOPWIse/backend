import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role, Status } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateApprovalDto {
  @ApiProperty({
    description: 'ID of the user requesting the approval',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  requestedId: string;

  @ApiProperty({
    description: 'Description of the approval request',
    example: 'Request for project access',
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Status of the approval',
    enum: Status,
    default: Status.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status = Status.PENDING;

  @ApiProperty({
    description: 'ID of the user approving the request',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @ApiProperty({
    description: 'Roles allowed for this approval',
    enum: Role,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  allowedRole?: Role[];
}

export class UpdateApprovalDto extends PartialType(CreateApprovalDto) {}
