import { IsMongoId, IsOptional, IsIn } from 'class-validator';

export class CreateMembershipDto {
    @IsMongoId()
    tenantId!: string;

    @IsMongoId()
    userId!: string;

    @IsOptional()
    @IsIn(['owner', 'manager', 'staff'])
    role?: 'owner' | 'manager' | 'staff';
}