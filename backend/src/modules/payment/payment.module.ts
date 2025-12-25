import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
