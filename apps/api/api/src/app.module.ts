import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsModule } from './tenants/tenants.module';
import { TenantDetailsModule } from './tenant-details/tenant-details.module';
import { AuthModule } from './auth/auth.module';
import { TenantAccountsModule } from './tenant-accounts/tenant-accounts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

ConfigModule.forRoot({ isGlobal: true });
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    AuthModule,
    TenantsModule,
    TenantDetailsModule,
    TenantAccountsModule,
  ],
})
export class AppModule {}