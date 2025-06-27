import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role, SopWiseUser } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { AddCommentDto } from '@sopwise/modules/sop/dto/add-comment.dto';
import { CreateSopDto } from '@sopwise/modules/sop/dto/sop.dto';
import { SopService } from '@sopwise/modules/sop/sop.service';
import { GetCurrentUser } from '@sopwise/modules/user/decorator/current-user.decorator';
import { Roles } from '@sopwise/roles/roles.decorator';
import { RolesGuard } from '@sopwise/roles/roles.guard';
import multer from 'fastify-multer';

const upload = multer({ dest: 'uploads/' });
export const imageFileFilter = (req: Request, file: Express.Multer.File, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

@ApiTags('SOPs')
@ApiBearerAuth()
@Controller('sop')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SCIENTIST, Role.VP, Role.TECHNICIAN)
export class SopController {
  constructor(private readonly sopService: SopService) {}

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all SOPs',
    description: 'Retrieves a paginated list of all SOPs. Only accessible to ADMIN and AUTHOR roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the list of SOPs.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllSops(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginationQueryDto,
  ) {
    return await this.sopService.listSop(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get SOP by ID',
    description: 'Retrieves a specific SOP by its ID. Only accessible to ADMIN and AUTHOR roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the SOP details with its content.',
  })
  @ApiResponse({ status: 404, description: 'SOP not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSopById(@Param('id') id: string) {
    return await this.sopService.findById(id);
  }

  @Post('get-sops')
  @HttpCode(HttpStatus.OK)
  async getSopsByListofIds(@Body() ids: string[]) {
    return await this.sopService.getSopByListOfIds(ids);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update SOP by ID',
    description: 'Updates the details of a specific SOP by its ID. Only accessible to ADMIN and AUTHOR roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'SOP updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'SOP not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSop(@GetCurrentUser() user: SopWiseUser, @Param('id') id: string, @Body() body: Partial<CreateSopDto>) {
    return await this.sopService.updateSop(id, { authorId: user.id, ...body });
  }

  @Patch('/flow-data/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update SOP by ID',
    description: 'Updates the flow data of a specific SOP by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'SOP updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'SOP not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateFlowData(@Param('id') id: string, @Body() body: string | object) {
    return await this.sopService.updateFlowData(id, body);
  }

  @Get('/flow-data/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get flow data of SOP by ID',
  })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 404, description: 'SOP not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFlowData(@Param('id') id: string) {
    return await this.sopService.getFlowDataById(id);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new SOP',
    description: 'Creates a new SOP with the provided data. Only accessible to ADMIN and AUTHOR roles.',
  })
  @ApiResponse({
    status: 201,
    description: 'SOP created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSop(@GetCurrentUser() user: SopWiseUser, @Body() body: CreateSopDto) {
    return await this.sopService.createSop({ authorId: user.id, ...body });
  }

  @Patch('/approve/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a SOP',
    description: 'Approves a SOP. Only accessible to ADMIN and AUTHOR roles.',
  })
  async approve(@Param('id') id: string, @GetCurrentUser() user: SopWiseUser) {
    return this.sopService.approveOnId(id, user.id);
  }

  @Patch('/reject/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a SOP',
    description: 'Rejects a SOP. Only accessible to ADMIN and AUTHOR roles.',
  })
  async reject(@Param('id') id: string, @GetCurrentUser() user: SopWiseUser) {
    return this.sopService.rejectOnId(id, user.id);
  }

  @Patch('/publish/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish a SOP',
    description: 'Publishes a SOP. Only accessible to ADMIN and AUTHOR roles.',
  })
  async publish(@Param('id') id: string, @GetCurrentUser() user: SopWiseUser) {
    return await this.sopService.publishSop(id, user.id);
  }

  @Post('/:id/comment')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add comments to SOP',
    description: 'Needs content id, comment body to create comment',
  })
  async createComment(@Param('id') id: string, @GetCurrentUser() user: SopWiseUser, @Body() body: AddCommentDto) {
    const { content, ...rest } = body;
    rest.contentId = id;
    rest.authorId = user.id;

    return await this.sopService.patchContentCreateComment(id, content, rest);
  }

  @Patch('/:id/comment/:comment_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add comments to SOP',
    description: 'Needs content id, comment body to create comment',
  })
  async resolveComment(
    @Param('id') id: string,
    @Param('comment_id') commentId: string,
    @Body() body: { content: string },
  ) {
    return await this.sopService.patchContentResolveComment(id, commentId, body.content);
  }

  // @Post('get-parsed')
  // async getParsed(@Body() body: string) {
  //   return createParser.parse(body);
  // }

  @Get('/my-sop/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get SOP by user ID',
  })
  async getMySop(@Param('id') id: string) {
    return await this.sopService.findSopByUserId(id);
  }
}
