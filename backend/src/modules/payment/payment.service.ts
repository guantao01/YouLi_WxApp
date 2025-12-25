import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Freeze funds for escrow (when order is created)
   * Buyer's balance -> frozen_balance
   */
  async freezeFunds(userId: number, amount: number, orderId: number, queryRunner: QueryRunner): Promise<void> {
    const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Move funds from balance to frozen_balance
    user.balance = Number(user.balance) - Number(amount);
    user.frozen_balance = Number(user.frozen_balance) + Number(amount);

    await queryRunner.manager.save(user);

    // Log transaction (could be saved to transaction_records table)
    console.log(`Froze ${amount} for user ${userId}, order ${orderId}`);
  }

  /**
   * Release funds from escrow to seller (when order is confirmed)
   * Buyer's frozen_balance -> Seller's balance
   */
  async releaseFunds(buyerId: number, sellerId: number, amount: number, orderId: number, queryRunner: QueryRunner): Promise<void> {
    const buyer = await queryRunner.manager.findOne(User, { where: { id: buyerId } });
    const seller = await queryRunner.manager.findOne(User, { where: { id: sellerId } });

    if (!buyer || !seller) {
      throw new BadRequestException('User not found');
    }

    if (buyer.frozen_balance < amount) {
      throw new BadRequestException('Insufficient frozen balance');
    }

    // Remove from buyer's frozen balance
    buyer.frozen_balance = Number(buyer.frozen_balance) - Number(amount);
    await queryRunner.manager.save(buyer);

    // Add to seller's balance
    seller.balance = Number(seller.balance) + Number(amount);
    await queryRunner.manager.save(seller);

    console.log(`Released ${amount} from buyer ${buyerId} to seller ${sellerId}, order ${orderId}`);
  }

  /**
   * Refund frozen funds to buyer (when refund is approved)
   * Buyer's frozen_balance -> Buyer's balance
   */
  async refundFunds(buyerId: number, amount: number, orderId: number, queryRunner: QueryRunner): Promise<void> {
    const buyer = await queryRunner.manager.findOne(User, { where: { id: buyerId } });

    if (!buyer) {
      throw new BadRequestException('User not found');
    }

    if (buyer.frozen_balance < amount) {
      throw new BadRequestException('Insufficient frozen balance');
    }

    // Move from frozen_balance back to balance
    buyer.frozen_balance = Number(buyer.frozen_balance) - Number(amount);
    buyer.balance = Number(buyer.balance) + Number(amount);

    await queryRunner.manager.save(buyer);

    console.log(`Refunded ${amount} to buyer ${buyerId}, order ${orderId}`);
  }

  /**
   * Get user balance info
   */
  async getUserBalance(userId: number): Promise<{ balance: number; frozen_balance: number }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      balance: Number(user.balance),
      frozen_balance: Number(user.frozen_balance),
    };
  }
}
