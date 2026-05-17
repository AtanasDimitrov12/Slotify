import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from './counter.schema';
import { Stage, StageSchema } from './stage.schema';
import { StagesController } from './stages.controller';
import { StagesService } from './stages.service';
import { Ticket, TicketSchema } from './ticket.schema';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Counter.name, schema: CounterSchema },
      { name: Stage.name, schema: StageSchema },
    ]),
  ],
  controllers: [TicketsController, StagesController],
  providers: [TicketsService, StagesService],
  exports: [TicketsService, StagesService, MongooseModule],
})
export class TicketsModule {}
