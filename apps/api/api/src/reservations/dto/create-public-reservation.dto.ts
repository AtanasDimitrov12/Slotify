import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreatePublicReservationDto {
  @IsString()
  serviceId!: string;

  @IsMongoId()
  staffId!: string;

  @IsDateString()
  startTime!: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  lockId?: string;

  @IsString()
  @Length(2, 120)
  customerName!: string;

  @IsString()
  @Length(5, 40)
  @Matches(/^[+()\-\s0-9]{5,40}$/, {
    message: 'customerPhone contains invalid characters',
  })
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  @Length(0, 200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}
