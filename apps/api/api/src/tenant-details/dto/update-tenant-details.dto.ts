import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDetailsDto } from './create-tenant-details.dto';

export class UpdateTenantDetailsDto extends PartialType(CreateTenantDetailsDto) {}