import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantAccountDto } from './create-tenant-account.dto';

export class UpdateTenantAccountDto extends PartialType(CreateTenantAccountDto) {}