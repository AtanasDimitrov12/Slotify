import { IsBoolean, IsEmail, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() houseNumber?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() country?: string;
}

class OpeningTimeRangeDto {
  @IsString() start!: string; // "09:00"
  @IsString() end!: string;   // "18:00"
}

class OpeningHoursDto {
  @IsOptional() @Type(() => OpeningTimeRangeDto) mon?: OpeningTimeRangeDto[];
  @IsOptional() @Type(() => OpeningTimeRangeDto) tue?: OpeningTimeRangeDto[];
  @IsOptional() @Type(() => OpeningTimeRangeDto) wed?: OpeningTimeRangeDto[];
  @IsOptional() @Type(() => OpeningTimeRangeDto) thu?: OpeningTimeRangeDto[];
  @IsOptional() @Type(() => OpeningTimeRangeDto) fri?: OpeningTimeRangeDto[];
  @IsOptional() @Type(() => OpeningTimeRangeDto) sat?: OpeningTimeRangeDto[];
  @IsOptional() @Type(() => OpeningTimeRangeDto) sun?: OpeningTimeRangeDto[];
}

class SocialLinksDto {
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() tiktok?: string;
}

class GeoDto {
  @IsOptional() lat?: number;
  @IsOptional() lng?: number;
}

export class CreateTenantDetailsDto {
  @IsString()
  tenantId!: string;

  @IsOptional() @ValidateNested() @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional() @ValidateNested() @Type(() => OpeningHoursDto)
  openingHours?: OpeningHoursDto;

  @IsOptional() @IsString()
  contactPersonName?: string;

  @IsOptional() @IsEmail()
  contactEmail?: string;

  @IsOptional() @IsString()
  contactPhone?: string;

  @IsOptional() @IsString()
  timezone?: string;

  @IsOptional() @IsString()
  locale?: string;

  @IsOptional() @IsUrl()
  websiteUrl?: string;

  @IsOptional() @ValidateNested() @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsOptional() @IsUrl()
  logoUrl?: string;

  @IsOptional() @IsUrl()
  coverImageUrl?: string;

  @IsOptional() @ValidateNested() @Type(() => GeoDto)
  geo?: GeoDto;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @IsOptional() @IsString()
  notes?: string;
}