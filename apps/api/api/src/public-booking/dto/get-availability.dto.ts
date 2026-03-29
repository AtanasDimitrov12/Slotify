import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class GetAvailabilityDto {
  @IsMongoId()
  serviceId!: string;

  @IsOptional()
  @IsMongoId()
  staffId?: string;

  @IsDateString()
  date!: string;
}
