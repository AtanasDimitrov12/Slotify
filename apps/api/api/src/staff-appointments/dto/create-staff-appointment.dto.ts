import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateStaffAppointmentDto {
  @IsMongoId()
  @IsNotEmpty()
  staffServiceAssignmentId!: string;

  @IsISO8601()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Matches(/^[+()\-\s0-9]{5,40}$/, {
    message: 'customerPhone contains invalid characters',
  })
  customerPhone!: string;

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
