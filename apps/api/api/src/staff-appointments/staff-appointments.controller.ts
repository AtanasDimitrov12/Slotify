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
import { CreateStaffAppointmentDto } from './dto/create-staff-appointment.dto';
import { ListStaffAppointmentsDto } from './dto/list-staff-appointments.dto';
import { UpdateStaffAppointmentDto } from './dto/update-staff-appointment.dto';
import { UpdateStaffAppointmentStatusDto } from './dto/update-staff-appointment-status.dto';
import { StaffAppointmentsService } from './staff-appointments.service';

@UseGuards(JwtAuthGuard)
@Controller('staff/me/appointments')
export class StaffAppointmentsController {
  constructor(private readonly staffAppointmentsService: StaffAppointmentsService) {}

  @Get('services')
  listServices(@CurrentUser() user: JwtPayload) {
    if (user.tenantId === undefined) {
      throw new Error('Tenant ID is required to list bookable services for staff');
    }
    return this.staffAppointmentsService.listBookableServicesForStaff({
      tenantId: user.tenantId,
      userId: user.sub,
    });
  }

  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() query: ListStaffAppointmentsDto) {
    if (user.tenantId === undefined) {
      throw new Error('Tenant ID is required to list bookable services for staff');
    }
    return this.staffAppointmentsService.list({
      tenantId: user.tenantId,
      userId: user.sub,
      date: query.date,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Get(':id/customer-insights')
  getCustomerInsights(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
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
      throw new Error('Tenant ID is required to list bookable services for staff');
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
      throw new Error('Tenant ID is required to list bookable services for staff');
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
      throw new Error('Tenant ID is required to list bookable services for staff');
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
      throw new Error('Tenant ID is required to list bookable services for staff');
    }

    return this.staffAppointmentsService.cancelForStaff({
      tenantId: user.tenantId,
      userId: user.sub,
      reservationId: id,
    });
  }
}
