import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { StaffService } from './staff.service';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';
import { UpdateStaffProfileDto } from '../staff-profiles/dto/update-staff-profile.dto';
import { UpdateStaffAvailabilityDto } from '../staff-availability/dto/update-staff-availability.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

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

  @Get('me/time-off')
  @UseGuards(JwtAuthGuard)
  getMyTimeOff(@CurrentUser() currentUser: any) {
    return this.staffService.getMyTimeOff(currentUser);
  }

  @Post('me/time-off')
  @UseGuards(JwtAuthGuard)
  createMyTimeOff(
    @CurrentUser() currentUser: any,
    @Body() dto: { startDate: string; endDate: string; reason?: string },
  ) {
    return this.staffService.createMyTimeOff(currentUser, dto);
  }

  @Delete('me/time-off/:id')
  @UseGuards(JwtAuthGuard)
  removeMyTimeOff(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
  ) {
    return this.staffService.removeMyTimeOff(currentUser, id);
  }

  @Get()
@UseGuards(JwtAuthGuard)
list(@CurrentUser() currentUser: any) {
  return this.staffService.listStaff(currentUser);
}

  @Get('me/services')
  @UseGuards(JwtAuthGuard)
  getMyServices(@CurrentUser() currentUser: any) {
    return this.staffService.getMyServices(currentUser);
  }

  @Post('me/services')
  @UseGuards(JwtAuthGuard)
  createMyService(
    @CurrentUser() currentUser: any,
    @Body() dto: { serviceId: string; durationMin?: number; priceEUR?: number },
  ) {
    return this.staffService.createMyService(currentUser, dto);
  }

  @Put('me/services/:id')
  @UseGuards(JwtAuthGuard)
  updateMyService(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
    @Body() dto: { durationMin?: number; priceEUR?: number; isOffered?: boolean },
  ) {
    return this.staffService.updateMyService(currentUser, id, dto);
  }

  @Delete('me/services/:id')
  @UseGuards(JwtAuthGuard)
  removeMyService(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
  ) {
    return this.staffService.removeMyService(currentUser, id);
  }

  @Post('onboard')
  @UseGuards(JwtAuthGuard)
  onboard(@CurrentUser() currentUser: any, @Body() dto: CreateStaffAccountDto) {
    return this.staffService.onboard(currentUser, dto);
  }
}