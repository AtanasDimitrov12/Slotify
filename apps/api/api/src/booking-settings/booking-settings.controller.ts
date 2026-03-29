import { Body, Controller, Get, Put, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { BookingSettingsService } from './booking-settings.service';
import type { UpsertTenantBookingSettingsDto } from './dto/upsert-tenant-booking-settings.dto';

@Controller('owner/settings/booking')
@UseGuards(JwtAuthGuard)
export class BookingSettingsController {
  constructor(private readonly bookingSettingsService: BookingSettingsService) {}

  private getTenantId(currentUser: any): string {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    if (!['owner', 'manager'].includes(currentUser?.role)) {
      throw new UnauthorizedException('You are not allowed to manage booking settings');
    }

    return tenantId;
  }

  @Get()
  getSettings(@CurrentUser() currentUser: any) {
    const tenantId = this.getTenantId(currentUser);
    return this.bookingSettingsService.getOrCreateByTenantId(tenantId);
  }

  @Put()
  updateSettings(@CurrentUser() currentUser: any, @Body() dto: UpsertTenantBookingSettingsDto) {
    const tenantId = this.getTenantId(currentUser);
    return this.bookingSettingsService.upsertByTenantId(tenantId, dto);
  }
}
