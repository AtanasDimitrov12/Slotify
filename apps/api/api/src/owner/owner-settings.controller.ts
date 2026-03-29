import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { UpdateBusinessGeneralDto } from './dto/update-business-general.dto';
import type { UpdateOpeningHoursDto } from './dto/update-opening-hours.dto';
import type { OwnerSettingsService } from './owner-settings.service';

@Controller('owner/settings')
@UseGuards(JwtAuthGuard)
export class OwnerSettingsController {
  constructor(private readonly ownerSettingsService: OwnerSettingsService) {}

  @Get()
  getSettings(@CurrentUser() currentUser: any) {
    return this.ownerSettingsService.getSettings(currentUser);
  }

  @Put('general')
  updateGeneral(@CurrentUser() currentUser: any, @Body() dto: UpdateBusinessGeneralDto) {
    return this.ownerSettingsService.updateGeneral(currentUser, dto);
  }

  @Put('opening-hours')
  updateOpeningHours(@CurrentUser() currentUser: any, @Body() dto: UpdateOpeningHoursDto) {
    return this.ownerSettingsService.updateOpeningHours(currentUser, dto);
  }
}
