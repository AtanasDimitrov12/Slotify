import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerLocationDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

export class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  remindersEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  promotionsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  lastMinuteDealsEnabled?: boolean;
}

export class PreferredBookingSlotDto {
  @IsNumber()
  @IsNotEmpty()
  dayOfWeek!: number;

  @IsString()
  @IsNotEmpty()
  timeSlot!: string;
}

export class CreateCustomerProfileDto {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerLocationDto)
  location?: CustomerLocationDto;

  @IsOptional()
  @IsEnum(['morning', 'afternoon', 'evening'])
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';

  @IsOptional()
  @IsNumber({}, { each: true })
  preferredDaysOfWeek?: number[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PreferredBookingSlotDto)
  preferredBookingSlots?: PreferredBookingSlotDto[];

  @IsOptional()
  @IsMongoId({ each: true })
  preferredServiceIds?: string[];

  @IsOptional()
  @IsMongoId({ each: true })
  favoriteSalonIds?: string[];

  @IsOptional()
  @IsMongoId({ each: true })
  preferredStaffIds?: string[];

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto;
}
