import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WelfareService } from './welfare.service';
import { WelfareController } from './welfare.controller';
import { MissingChild } from './missing-child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MissingChild])],
  controllers: [WelfareController],
  providers: [WelfareService],
  exports: [WelfareService],
})
export class WelfareModule {}
