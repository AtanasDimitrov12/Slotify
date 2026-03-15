import { IsEmail, IsISO8601, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStaffAppointmentDto {
  @IsOptional()
  @IsMongoId()
  staffServiceAssignmentId?: string;

  @IsOptional()
  @IsISO8601()
  startTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  customerPhone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}