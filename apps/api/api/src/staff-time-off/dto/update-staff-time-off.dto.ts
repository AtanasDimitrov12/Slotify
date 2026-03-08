import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateStaffTimeOffDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsIn(['requested', 'approved', 'denied'])
  status?: 'requested' | 'approved' | 'denied';
}