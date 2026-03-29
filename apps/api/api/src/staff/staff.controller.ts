import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateStaffAvailabilityDto } from '../staff-availability/dto/update-staff-availability.dto';
import { UpdateStaffProfileDto } from '../staff-profiles/dto/update-staff-profile.dto';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser() currentUser: JwtPayload) {
    return this.staffService.getMyProfile(currentUser);
  }

  @Put('me/profile')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(@CurrentUser() currentUser: JwtPayload, @Body() dto: UpdateStaffProfileDto) {
    return this.staffService.updateMyProfile(currentUser, dto);
  }

  @Get('me/availability')
  @UseGuards(JwtAuthGuard)
  getMyAvailability(@CurrentUser() currentUser: JwtPayload) {
    return this.staffService.getMyAvailability(currentUser);
  }

  @Put('me/availability')
  @UseGuards(JwtAuthGuard)
  updateMyAvailability(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: UpdateStaffAvailabilityDto,
  ) {
    return this.staffService.updateMyAvailability(currentUser, dto);
  }

  @Get('me/time-off')
  @UseGuards(JwtAuthGuard)
  getMyTimeOff(@CurrentUser() currentUser: JwtPayload) {
    return this.staffService.getMyTimeOff(currentUser);
  }

  @Post('me/time-off')
  @UseGuards(JwtAuthGuard)
  createMyTimeOff(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: { startDate: string; endDate: string; reason?: string },
  ) {
    return this.staffService.createMyTimeOff(currentUser, dto);
  }

  @Delete('me/time-off/:id')
  @UseGuards(JwtAuthGuard)
  removeMyTimeOff(@CurrentUser() currentUser: JwtPayload, @Param('id') id: string) {
    return this.staffService.removeMyTimeOff(currentUser, id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() currentUser: JwtPayload) {
    return this.staffService.listStaff(currentUser);
  }

  @Get('me/services')
  @UseGuards(JwtAuthGuard)
  getMyServices(@CurrentUser() currentUser: JwtPayload) {
    return this.staffService.getMyServices(currentUser);
  }

  @Post('me/services')
  @UseGuards(JwtAuthGuard)
  createMyService(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: { serviceId: string; durationMin?: number; priceEUR?: number },
  ) {
    return this.staffService.createMyService(currentUser, dto);
  }

  @Put('me/services/:id')
  @UseGuards(JwtAuthGuard)
  updateMyService(
    @CurrentUser() currentUser: JwtPayload,
    @Param('id') id: string,
    @Body()
    dto: { durationMin?: number; priceEUR?: number; isOffered?: boolean },
  ) {
    return this.staffService.updateMyService(currentUser, id, dto);
  }

  @Delete('me/services/:id')
  @UseGuards(JwtAuthGuard)
  removeMyService(@CurrentUser() currentUser: JwtPayload, @Param('id') id: string) {
    return this.staffService.removeMyService(currentUser, id);
  }

  @Post('onboard')
  @UseGuards(JwtAuthGuard)
  onboard(@CurrentUser() currentUser: JwtPayload, @Body() dto: CreateStaffAccountDto) {
    return this.staffService.onboard(currentUser, dto);
  }
}
