import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateBusinessGeneralDto } from './dto/update-business-general.dto';
import { UpdateOpeningHoursDto } from './dto/update-opening-hours.dto';
import { OwnerSettingsService } from './owner-settings.service';

@Controller('owner/settings')
@UseGuards(JwtAuthGuard)
export class OwnerSettingsController {
  constructor(private readonly ownerSettingsService: OwnerSettingsService) {}

  @Get()
  getSettings(@CurrentUser() currentUser: JwtPayload) {
    return this.ownerSettingsService.getSettings(currentUser);
  }

  @Put('general')
  updateGeneral(@CurrentUser() currentUser: JwtPayload, @Body() dto: UpdateBusinessGeneralDto) {
    return this.ownerSettingsService.updateGeneral(currentUser, dto);
  }

  @Put('opening-hours')
  updateOpeningHours(@CurrentUser() currentUser: JwtPayload, @Body() dto: UpdateOpeningHoursDto) {
    return this.ownerSettingsService.updateOpeningHours(currentUser, dto);
  }
}
