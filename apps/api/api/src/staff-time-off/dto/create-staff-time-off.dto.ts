import { IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateStaffTimeOffDto {
  @IsMongoId()
  @IsNotEmpty()
  tenantId!: string;

  @IsMongoId()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}