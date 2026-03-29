import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsISO8601,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

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
  @Matches(/^[+()\-\s0-9]{5,40}$/, {
    message: 'customerPhone contains invalid characters',
  })
  customerPhone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
