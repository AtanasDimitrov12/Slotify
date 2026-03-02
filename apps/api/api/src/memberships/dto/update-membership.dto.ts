import { IsOptional, IsIn, IsBoolean } from 'class-validator';

export class UpdateMembershipDto {
    @IsOptional()
    @IsIn(['owner', 'manager', 'staff'])
    role?: 'owner' | 'manager' | 'staff';

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}