import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCustomerProfileDto } from './create-customer-profile.dto';

export class UpdateCustomerProfileDto extends PartialType(OmitType(CreateCustomerProfileDto, ['userId'] as const)) {}
