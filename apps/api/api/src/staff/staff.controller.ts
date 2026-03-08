import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { StaffService } from './staff.service';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() currentUser: any) {
    return this.staffService.findAllForTenant(currentUser);
  }

  @Post('onboard')
  @UseGuards(JwtAuthGuard)
  onboard(@CurrentUser() currentUser: any, @Body() dto: CreateStaffAccountDto) {
    return this.staffService.onboard(currentUser, dto);
  }
}