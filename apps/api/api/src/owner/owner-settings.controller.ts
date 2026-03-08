import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OwnerSettingsService } from './owner-settings.service';
import { UpdateBusinessGeneralDto } from './dto/update-business-general.dto';
import { UpdateOpeningHoursDto } from './dto/update-opening-hours.dto';

@Controller('owner/settings')
@UseGuards(JwtAuthGuard)
export class OwnerSettingsController {
  constructor(private readonly ownerSettingsService: OwnerSettingsService) {}

  @Get()
  getSettings(@CurrentUser() currentUser: any) {
    return this.ownerSettingsService.getSettings(currentUser);
  }

  @Put('general')
  updateGeneral(
    @CurrentUser() currentUser: any,
    @Body() dto: UpdateBusinessGeneralDto,
  ) {
    return this.ownerSettingsService.updateGeneral(currentUser, dto);
  }

  @Put('opening-hours')
  updateOpeningHours(
    @CurrentUser() currentUser: any,
    @Body() dto: UpdateOpeningHoursDto,
  ) {
    return this.ownerSettingsService.updateOpeningHours(currentUser, dto);
  }
}