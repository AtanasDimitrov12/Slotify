import { IsDateString, IsMongoId, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateStaffTimeOffDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  userId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsIn(['requested', 'approved', 'denied'])
  status?: 'requested' | 'approved' | 'denied';
}