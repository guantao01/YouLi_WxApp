import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUserProfile(@Param('id') id: number) {
    return await this.usersService.getUserProfile(id);
  }

  @Post(':id/verify')
  async verifyRealName(
    @Param('id') id: number,
    @Body('realName') realName: string,
    @Body('idCard') idCard: string,
  ) {
    return await this.usersService.verifyRealName(id, realName, idCard);
  }

  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() userData: any) {
    return await this.usersService.updateUser(id, userData);
  }
}
