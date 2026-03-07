import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { StaffAvailabilityService } from './staff-availability.service';
import { CreateStaffAvailabilityDto } from './dto/create-staff-availability.dto';
import { UpdateStaffAvailabilityDto } from './dto/update-staff-availability.dto';

@Controller('staff-availability')
export class StaffAvailabilityController {
  constructor(private readonly staffAvailabilityService: StaffAvailabilityService) {}

  @Post()
  create(@Body() dto: CreateStaffAvailabilityDto) {
    return this.staffAvailabilityService.create(dto);
  }

  @Get()
  findAllByStaff(
    @Query('tenantId') tenantId: string,
    @Query('userId') userId: string,
  ) {
    return this.staffAvailabilityService.findAllByStaff(tenantId, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffAvailabilityDto) {
    return this.staffAvailabilityService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffAvailabilityService.remove(id);
  }
}