import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MembershipsService } from '../memberships/memberships.service';
import { CreateStaffAppointmentDto } from './dto/create-staff-appointment.dto';
import { ListStaffAppointmentsDto } from './dto/list-staff-appointments.dto';
import { UpdateStaffAppointmentDto } from './dto/update-staff-appointment.dto';
import { UpdateStaffAppointmentStatusDto } from './dto/update-staff-appointment-status.dto';
import { StaffAppointmentsService } from './staff-appointments.service';

@UseGuards(JwtAuthGuard)
@Controller('staff/me/appointments')
export class StaffAppointmentsController {
  constructor(
    private readonly staffAppointmentsService: StaffAppointmentsService,
    private readonly membershipsService: MembershipsService,
  ) {}

  private async getStaffTenantIds(userId: string): Promise<string[]> {
    const memberships = await this.membershipsService.findAllByUserId(userId);
    return memberships
      .filter((m) => m.role === 'staff')
      .map((m) => m.tenantId?._id?.toString() || m.tenantId?.toString());
  }

  @Get('services')
  async listServices(@CurrentUser() user: JwtPayload) {
    const tenantIds = await this.getStaffTenantIds(user.sub);
    return this.staffAppointmentsService.listBookableServicesForStaff({
      tenantIds,
      userId: user.sub,
    });
  }

  @Get()
  async list(@CurrentUser() user: JwtPayload, @Query() query: ListStaffAppointmentsDto) {
    const tenantIds = await this.getStaffTenantIds(user.sub);
    return this.staffAppointmentsService.list({
      tenantIds,
      userId: user.sub,
      date: query.date,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Get(':id/customer-insights')
  async getCustomerInsights(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    if (user.tenantId === undefined) {
      throw new Error('Tenant ID is required for customer insights');
    }
    return this.staffAppointmentsService.getCustomerInsights({
      tenantId: user.tenantId,
      reservationId: id,
    });
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() body: CreateStaffAppointmentDto) {
    if (user.tenantId === undefined) {
      throw new Error('Tenant ID is required to create appointments');
    }
    return this.staffAppointmentsService.createForStaff({
      tenantId: user.tenantId,
      userId: user.sub,
      dto: body,
    });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: UpdateStaffAppointmentDto,
  ) {
    if (user.tenantId === undefined) {
      throw new Error('Tenant ID is required to update appointments');
    }

    return this.staffAppointmentsService.updateForStaff({
      tenantId: user.tenantId,
      userId: user.sub,
      reservationId: id,
      dto: body,
    });
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: UpdateStaffAppointmentStatusDto,
  ) {
    if (user.tenantId === undefined) {
      throw new Error('Tenant ID is required to update status');
    }

    return this.staffAppointmentsService.updateStatusForStaff({
      tenantId: user.tenantId,
      userId: user.sub,
      reservationId: id,
      status: body.status,
    });
  }

  @Delete(':id')
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    if (user.tenantId === undefined) {
      throw new Error('Tenant ID is required to cancel appointments');
    }

    return this.staffAppointmentsService.cancelForStaff({
      tenantId: user.tenantId,
      userId: user.sub,
      reservationId: id,
    });
  }
}
