import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { StaffTimeOffService } from './staff-time-off.service';
import { CreateStaffTimeOffDto } from './dto/create-staff-time-off.dto';
import { UpdateStaffTimeOffDto } from './dto/update-staff-time-off.dto';

@Controller('staff-time-off')
export class StaffTimeOffController {
  constructor(private readonly staffTimeOffService: StaffTimeOffService) {}

  @Post()
  create(@Body() dto: CreateStaffTimeOffDto) {
    return this.staffTimeOffService.create(dto);
  }

  @Get()
  findAllByStaff(
    @Query('tenantId') tenantId: string,
    @Query('userId') userId: string,
  ) {
    return this.staffTimeOffService.findAllByStaff(tenantId, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffTimeOffDto) {
    return this.staffTimeOffService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffTimeOffService.remove(id);
  }
}