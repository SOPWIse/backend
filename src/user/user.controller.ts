import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetCurrentUser } from './decorator/current-user.decorator';
import { Role, SopWiseUser } from '@prisma/client';
import { UserService } from './user.service';
import { query } from 'winston';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/pagination/pagination.dto';
import { UpdateUserDto } from 'src/auth/dto/auth.update-user-dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@GetCurrentUser() user: SopWiseUser) {
    return user;
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }
}
