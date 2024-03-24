import { Module } from '@nestjs/common';
import { OptimizeService } from './optimize.service';
import { OptimizeController } from './optimize.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'images',
    }),
  ],
  controllers: [OptimizeController],
  providers: [OptimizeService],
})
export class OptimizeModule {}
