import {
  IsBoolean,
  IsInt,
  IsNotEmptyObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BookingBufferConfigDto {
  @IsBoolean()
  enabled!: boolean;

  @IsInt()
  @Min(0)
  minutes!: number;
}

export class UpsertTenantBookingSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingBufferConfigDto)
  @IsNotEmptyObject()
  bufferBefore?: BookingBufferConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BookingBufferConfigDto)
  @IsNotEmptyObject()
  bufferAfter?: BookingBufferConfigDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimumNoticeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maximumDaysInAdvance?: number;

  @IsOptional()
  @IsBoolean()
  autoConfirmReservations?: boolean;

  @IsOptional()
  @IsBoolean()
  allowBookingToEndAfterWorkingHours?: boolean;

  @IsOptional()
  @IsBoolean()
  allowCustomerChooseSpecificStaff?: boolean;
}