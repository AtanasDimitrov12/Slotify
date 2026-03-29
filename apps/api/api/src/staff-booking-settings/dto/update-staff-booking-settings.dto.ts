import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';

class BufferOverrideDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minutes?: number;
}

class StaffBookingSettingsOverridesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BufferOverrideDto)
  bufferBefore?: BufferOverrideDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BufferOverrideDto)
  bufferAfter?: BufferOverrideDto;

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

export class UpdateStaffBookingSettingsDto {
  @IsOptional()
  @IsBoolean()
  useGlobalSettings?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffBookingSettingsOverridesDto)
  overrides?: StaffBookingSettingsOverridesDto;
}
