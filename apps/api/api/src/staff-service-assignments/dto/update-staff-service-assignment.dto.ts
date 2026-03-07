import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffServiceAssignmentDto } from './create-staff-service-assignment.dto';

export class UpdateStaffServiceAssignmentDto extends PartialType(
  CreateStaffServiceAssignmentDto,
) {}