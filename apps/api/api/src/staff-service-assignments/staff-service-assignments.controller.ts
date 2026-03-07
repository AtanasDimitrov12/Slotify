import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { StaffServiceAssignmentsService } from './staff-service-assignments.service';
import { CreateStaffServiceAssignmentDto } from './dto/create-staff-service-assignment.dto';
import { UpdateStaffServiceAssignmentDto } from './dto/update-staff-service-assignment.dto';

@Controller('staff-service-assignments')
export class StaffServiceAssignmentsController {
  constructor(
    private readonly staffServiceAssignmentsService: StaffServiceAssignmentsService,
  ) {}

  @Post()
  create(@Body() dto: CreateStaffServiceAssignmentDto) {
    return this.staffServiceAssignmentsService.create(dto);
  }

  @Get()
  findAllByStaff(
    @Query('tenantId') tenantId: string,
    @Query('userId') userId: string,
  ) {
    return this.staffServiceAssignmentsService.findAllByStaff(tenantId, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffServiceAssignmentDto) {
    return this.staffServiceAssignmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffServiceAssignmentsService.remove(id);
  }
}