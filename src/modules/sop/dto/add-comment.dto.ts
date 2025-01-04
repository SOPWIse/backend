import { CreateCommentDto } from '@sopwise/modules/comment/dto/create.dto';
import { IsString } from 'class-validator';

export class AddCommentDto extends CreateCommentDto {
  @IsString()
  content!: string;
}
