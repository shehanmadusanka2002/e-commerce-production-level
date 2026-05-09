import { Controller, Post, Body, UseGuards, Request, Get, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  async sync(@Request() req, @Body() body: { email: string; fullName?: string }) {
    // req.user contains the decoded Supabase JWT. req.user.sub is the user ID.
    const userId = req.user.sub;
    return this.usersService.syncUser(userId, body.email, body.fullName);
  }

  // A quick endpoint to make someone an admin (For initial setup)
  @Post('make-admin')
  async makeAdmin(@Body() body: { email: string }) {
    return this.usersService.makeAdmin(body.email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
