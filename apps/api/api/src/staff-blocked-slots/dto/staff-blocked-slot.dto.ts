import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateStaffBlockedSlotDto {
  @IsMongoId()
  @IsNotEmpty()
  tenantId!: string;

  @IsMongoId()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/)
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/)
  endTime!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateStaffBlockedSlotDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
