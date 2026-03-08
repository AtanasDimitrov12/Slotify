import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OpeningHoursDayDto {
  @IsEnum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
  key!: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end?: string;
}

export class UpdateOpeningHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDayDto)
  days!: OpeningHoursDayDto[];
}