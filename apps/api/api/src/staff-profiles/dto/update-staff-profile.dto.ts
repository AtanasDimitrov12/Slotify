import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffProfileDto } from './create-staff-profile.dto';
import { IsArray, IsOptional, IsString, Min, IsNumber } from 'class-validator';

export class UpdateStaffProfileDto extends PartialType(CreateStaffProfileDto) {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  expertise?: string[];

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}