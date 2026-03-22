import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReservationLockDto {
  @IsMongoId()
  serviceId!: string;

  @IsMongoId()
  staffId!: string;

  @IsDateString()
  startTime!: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  customerName?: string;

  @IsOptional()
  @IsEmail()
  @Length(0, 200)
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  customerEmail?: string;
}