import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantAccount, TenantAccountSchema } from './tenant-accounts.schema';
import { TenantAccountsService } from './tenant-accounts.service';
import { TenantAccountsController } from './tenant-accounts.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantAccount.name, schema: TenantAccountSchema },
    ]),
  ],
  providers: [TenantAccountsService],
  controllers: [TenantAccountsController],
  exports: [TenantAccountsService],
})
export class TenantAccountsModule {}