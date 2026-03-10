import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { StaffBookingSettingsService } from './staff-booking-settings.service';
import { UpdateStaffBookingSettingsDto } from './dto/update-staff-booking-settings.dto';

@Controller('staff-booking-settings')
@UseGuards(JwtAuthGuard)
export class StaffBookingSettingsController {
  constructor(
    private readonly staffBookingSettingsService: StaffBookingSettingsService,
  ) {}

  private getTenantId(currentUser: any): string {
    return currentUser?.tenantId;
  }

  private ensureOwnerOrManager(currentUser: any) {
    if (!['owner', 'manager'].includes(currentUser?.role)) {
      throw new UnauthorizedException(
        'You are not allowed to manage staff booking settings',
      );
    }
  }

  @Get(':userId')
  async getForStaff(
    @CurrentUser() currentUser: any,
    @Param('userId') userId: string,
  ) {
    this.ensureOwnerOrManager(currentUser);

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

    const updated = await this.staffBookingSettingsService.updateByStaff(
      this.getTenantId(currentUser),
      userId,
      dto,
    );

    const effective =
      await this.staffBookingSettingsService.getEffectiveSettings(
        this.getTenantId(currentUser),
        userId,
      );

    return {
      message: 'Staff booking settings updated successfully',
      settings: updated,
      effectiveSettings: effective.effectiveSettings,
    };
  }

  @Get('me/current')
  async getMyCurrentSettings(@CurrentUser() currentUser: any) {
    const tenantId = this.getTenantId(currentUser);
    const userId =
      currentUser?.sub ?? currentUser?.userId ?? currentUser?._id ?? currentUser?.id;

    return this.staffBookingSettingsService.getEffectiveSettings(tenantId, userId);
  }
}