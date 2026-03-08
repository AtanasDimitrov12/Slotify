import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { StaffService } from './staff.service';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';
import { UpdateStaffProfileDto } from '../staff-profiles/dto/update-staff-profile.dto';
import { UpdateStaffAvailabilityDto } from 'src/staff-availability/dto/update-staff-availability.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser() currentUser: any) {
    return this.staffService.getMyProfile(currentUser);
  }

  @Put('me/profile')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(
    @CurrentUser() currentUser: any,
    @Body() dto: UpdateStaffProfileDto,
  ) {
    return this.staffService.updateMyProfile(currentUser, dto);
  }

  @Get('me/availability')
  @UseGuards(JwtAuthGuard)
  getMyAvailability(@CurrentUser() currentUser: any) {
    return this.staffService.getMyAvailability(currentUser);
  }

  @Put('me/availability')
  @UseGuards(JwtAuthGuard)
  updateMyAvailability(
    @CurrentUser() currentUser: any,
    @Body() dto: UpdateStaffAvailabilityDto,
  ) {
    return this.staffService.updateMyAvailability(currentUser, dto);
  }

  @Post('onboard')
  @UseGuards(JwtAuthGuard)
  onboard(@CurrentUser() currentUser: any, @Body() dto: CreateStaffAccountDto) {
    return this.staffService.onboard(currentUser, dto);
  }
}