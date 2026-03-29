import { IsBoolean, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateStaffServiceAssignmentDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  userId!: string;

  @IsMongoId()
  serviceId!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  customDurationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customPrice?: number;

  @IsOptional()
  @IsBoolean()
  isOffered?: boolean;
}
