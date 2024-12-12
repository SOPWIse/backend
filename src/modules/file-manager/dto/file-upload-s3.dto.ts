import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { BaseUpdateDTO } from '@sopwise/common/models/base-model';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces';
import { IsOptional, IsString } from 'class-validator';

export interface IBaseModel {
  /**
   * The entity id
   */
  id: string;
  /**
   * The entity created date
   */
  createdAt: Date;
  /**
   * The entity updated date
   */
  updatedAt: Date;
}

export interface IFiles extends IBaseModel {
  title: string;
  file: MulterFile | string;
  visibility: string;
}

export type ICreateFile = Omit<IFiles, keyof IBaseModel>;
export type IUpdateFile = Partial<ICreateFile>;

export class CreateFileDTO implements ICreateFile {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'title', required: false })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'ADMIN', required: false })
  visibility: string;

  @IsOptional()
  @ApiProperty({ type: String, format: 'binary', required: true })
  file: MulterFile;

  @ApiResponseProperty({
    type: () => Date,
    example: '2022-08-01T14:09:36.071+00:00',
  })
  @IsOptional()
  createdAt: Date = new Date();

  @ApiResponseProperty({
    type: () => Date,
    example: '2022-08-01T14:09:36.071+00:00',
  })
  @IsOptional()
  updatedAt: Date = new Date();
}

export class CreateFileJsonDTO implements IUpdateFile {
  @IsOptional()
  @ApiProperty({ type: String, format: 'binary', required: true })
  file: MulterFile;
}

export class UpdateFileDTO
  extends IntersectionType(PartialType(CreateFileDTO), BaseUpdateDTO)
  implements IUpdateFile {}
