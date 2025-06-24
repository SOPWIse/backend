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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role, SopWiseUser } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { UpdateUserDto } from '@sopwise/modules/auth/dto/auth.update-user-dto';
import { JwtAuthGuard } from '@sopwise/modules/auth/guard/jwt.guard';
import { GetCurrentUser } from '@sopwise/modules/user/decorator/current-user.decorator';
import { UserService } from '@sopwise/modules/user/user.service';
import { Roles } from '@sopwise/roles/roles.decorator';
import { RolesGuard } from '@sopwise/roles/roles.guard';
@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  getCurrentUser(@GetCurrentUser() user: SopWiseUser) {
    return user;
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VP)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of users' })
  async getAllUsers(
    @Query(new ValidationPipe({ transform: true }))
    query: PaginationQueryDto,
  ) {
    return this.userService.getUsers(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user by id' })
  @HttpCode(HttpStatus.OK)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by id' })
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('get-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VP)
  @ApiOperation({ summary: 'Get user list by ids' })
  @HttpCode(HttpStatus.OK)
  async getUserByListOfIds(@Body() ids: string[]) {
    return this.userService.getUsersByIds(ids);
  }
}
