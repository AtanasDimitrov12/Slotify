import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CreateStaffProfileDto } from './create-staff-profile.dto';

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
