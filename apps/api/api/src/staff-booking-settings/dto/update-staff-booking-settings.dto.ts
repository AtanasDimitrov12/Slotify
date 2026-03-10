import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StaffBookingSettingsOverridesDto {
  @IsOptional()
  @IsBoolean()
  bufferBeforeEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  bufferBeforeMin?: number;

  @IsOptional()
  @IsBoolean()
  bufferAfterEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  bufferAfterMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimumNoticeMin?: number;

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
  @IsObject()
  @ValidateNested()
  @Type(() => StaffBookingSettingsOverridesDto)
  overrides?: StaffBookingSettingsOverridesDto;
}