import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffAvailabilityDto } from './create-staff-availability.dto';

export class UpdateStaffAvailabilityDto extends PartialType(CreateStaffAvailabilityDto) {}