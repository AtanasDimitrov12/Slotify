import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CreateStaffAvailabilityDto } from './dto/create-staff-availability.dto';
import { UpdateStaffAvailabilityDto } from './dto/update-staff-availability.dto';
import { StaffAvailabilityService } from './staff-availability.service';

@Controller('staff-availability')
export class StaffAvailabilityController {
  constructor(private readonly staffAvailabilityService: StaffAvailabilityService) {}

  @Post()
  create(@Body() dto: CreateStaffAvailabilityDto) {
    return this.staffAvailabilityService.create(dto);
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
