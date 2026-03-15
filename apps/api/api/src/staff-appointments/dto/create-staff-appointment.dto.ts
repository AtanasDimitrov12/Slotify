import { IsEmail, IsISO8601, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStaffAppointmentDto {
  @IsMongoId()
  staffServiceAssignmentId!: string;

  @IsISO8601()
  startTime!: string;

  @IsString()
  @MaxLength(120)
  customerName!: string;

  @IsString()
  @MaxLength(40)
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}