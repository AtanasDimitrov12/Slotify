import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AvailabilitySlotDto {
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime!: string;

  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class DayAvailabilityDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots!: AvailabilitySlotDto[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class CreateStaffAvailabilityDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  userId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DayAvailabilityDto)
  weeklyAvailability!: DayAvailabilityDto[];
}
