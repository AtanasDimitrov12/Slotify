import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIModule } from '../ai/ai.module';
import { Service, ServiceSchema } from './service.schema';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]), AIModule],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
