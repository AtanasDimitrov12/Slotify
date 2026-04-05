import { IsDateString, IsMongoId, IsOptional, IsString } from 'class-validator';

export class GetAvailabilityDto {
  @IsString()
  serviceId!: string;

  @IsOptional()
  @IsMongoId()
  staffId?: string;

  @IsDateString()
  date!: string;
}
