import { Body, Controller, Get, Param, Patch, Post, Delete, Query } from '@nestjs/common';
import { StaffProfilesService } from './staff-profiles.service';
import { CreateStaffProfileDto } from './dto/create-staff-profile.dto';
import { UpdateStaffProfileDto } from './dto/update-staff-profile.dto';

@Controller('staff-profiles')
export class StaffProfilesController {
  constructor(private readonly staffProfilesService: StaffProfilesService) {}

  @Post()
  create(@Body() dto: CreateStaffProfileDto) {
    return this.staffProfilesService.create(dto);
  }

  @Get()
  findAllByTenant(@Query('tenantId') tenantId: string) {
    return this.staffProfilesService.findAllByTenant(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffProfilesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffProfileDto) {
    return this.staffProfilesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffProfilesService.remove(id);
  }
}