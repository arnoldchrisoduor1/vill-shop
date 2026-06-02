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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../database/entities/user.entity';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('api/v1/profile')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('api/v1/profile')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/v1/profile/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('api/v1/admin/customers')
  adminFindAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.usersService.adminFindAll(Number(page), Number(limit), search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('api/v1/admin/customers/:id')
  adminFindById(@Param('id') id: string) {
    return this.usersService.adminFindById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('api/v1/admin/customers/:id/ban')
  banUser(@Param('id') id: string) {
    return this.usersService.banUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('api/v1/admin/customers/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.usersService.unbanUser(id);
  }
}
