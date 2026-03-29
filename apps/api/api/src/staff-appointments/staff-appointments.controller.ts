import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { CreateStaffAppointmentDto } from './dto/create-staff-appointment.dto';
import type { ListStaffAppointmentsDto } from './dto/list-staff-appointments.dto';
import type { UpdateStaffAppointmentDto } from './dto/update-staff-appointment.dto';
import type { UpdateStaffAppointmentStatusDto } from './dto/update-staff-appointment-status.dto';
import type { StaffAppointmentsService } from './staff-appointments.service';

@UseGuards(JwtAuthGuard)
@Controller('staff/me/appointments')
export class StaffAppointmentsController {
  constructor(private readonly staffAppointmentsService: StaffAppointmentsService) {}

  @Get('services')
  listServices(@Req() req: any) {
    return this.staffAppointmentsService.listBookableServicesForStaff({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
    });
  }

  @Get()
  list(@Req() req: any, @Query() query: ListStaffAppointmentsDto) {
    return this.staffAppointmentsService.listForDay({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      date: query.date,
    });
  }

  @Post()
  create(@Req() req: any, @Body() body: CreateStaffAppointmentDto) {
    return this.staffAppointmentsService.createForStaff({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      dto: body,
    });
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateStaffAppointmentDto) {
    return this.staffAppointmentsService.updateForStaff({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      reservationId: id,
      dto: body,
    });
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateStaffAppointmentStatusDto,
  ) {
    return this.staffAppointmentsService.updateStatusForStaff({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      reservationId: id,
      status: body.status,
    });
  }

  @Delete(':id')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.staffAppointmentsService.cancelForStaff({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      reservationId: id,
    });
  }
}
