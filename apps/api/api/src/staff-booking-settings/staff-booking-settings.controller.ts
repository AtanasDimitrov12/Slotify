import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { UpdateStaffBookingSettingsDto } from './dto/update-staff-booking-settings.dto';
import type { StaffBookingSettingsService } from './staff-booking-settings.service';

@Controller('staff-booking-settings')
@UseGuards(JwtAuthGuard)
export class StaffBookingSettingsController {
  constructor(private readonly staffBookingSettingsService: StaffBookingSettingsService) {}

  private getTenantId(currentUser: any): string {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    return tenantId;
  }

  private validateUserId(userId: string) {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user id');
    }
  }

  private ensureOwnerOrManager(currentUser: any) {
    if (!['owner', 'manager'].includes(currentUser?.role)) {
      throw new UnauthorizedException('You are not allowed to manage staff booking settings');
    }
  }

  @Get('me/current')
  async getMyCurrentSettings(@CurrentUser() currentUser: any) {
    const tenantId = this.getTenantId(currentUser);
    const userId = currentUser?.sub ?? currentUser?.userId ?? currentUser?._id ?? currentUser?.id;

    this.validateUserId(userId);

    return this.staffBookingSettingsService.getEffectiveSettings(tenantId, userId);
  }

  @Put('me/current')
  async updateMyCurrentSettings(
    @CurrentUser() currentUser: any,
    @Body() dto: UpdateStaffBookingSettingsDto,
  ) {
    const tenantId = this.getTenantId(currentUser);
    const userId = currentUser?.sub ?? currentUser?.userId ?? currentUser?._id ?? currentUser?.id;

    this.validateUserId(userId);

    const updated = await this.staffBookingSettingsService.updateByStaff(tenantId, userId, dto);

    const effective = await this.staffBookingSettingsService.getEffectiveSettings(tenantId, userId);

    return {
      message: 'Your booking settings updated successfully',
      settings: updated,
      effectiveSettings: effective.effectiveSettings,
    };
  }

  @Get(':userId')
  async getForStaff(@CurrentUser() currentUser: any, @Param('userId') userId: string) {
    this.ensureOwnerOrManager(currentUser);
    this.validateUserId(userId);

    return this.staffBookingSettingsService.getEffectiveSettings(
      this.getTenantId(currentUser),
      userId,
    );
  }

  @Put(':userId')
  async updateForStaff(
    @CurrentUser() currentUser: any,
    @Param('userId') userId: string,
    @Body() dto: UpdateStaffBookingSettingsDto,
  ) {
    this.ensureOwnerOrManager(currentUser);
    this.validateUserId(userId);

    const updated = await this.staffBookingSettingsService.updateByStaff(
      this.getTenantId(currentUser),
      userId,
      dto,
    );

    const effective = await this.staffBookingSettingsService.getEffectiveSettings(
      this.getTenantId(currentUser),
      userId,
    );

    return {
      message: 'Staff booking settings updated successfully',
      settings: updated,
      effectiveSettings: effective.effectiveSettings,
    };
  }
}
