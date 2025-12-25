import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { UserFootprint } from './footprint.entity';
import { TransactionLock } from './transaction-lock.entity';
import { Title } from './title.entity';
import { User } from '../users/user.entity';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(UserFootprint)
    private footprintsRepository: Repository<UserFootprint>,
    @InjectRepository(TransactionLock)
    private transactionLocksRepository: Repository<TransactionLock>,
    @InjectRepository(Title)
    private titlesRepository: Repository<Title>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Core map lighting logic with anti-cheating mechanism
   * Called when order is completed
   */
  async processMapLighting(
    buyerId: number,
    sellerId: number,
    province: string,
    orderId: number,
    queryRunner?: QueryRunner,
  ): Promise<{ lit: boolean; newProvince: boolean }> {
    const manager = queryRunner ? queryRunner.manager : this.footprintsRepository.manager;

    // Anti-fraud check: Check if these two users have already lit up this province
    const [userAId, userBId] = buyerId < sellerId ? [buyerId, sellerId] : [sellerId, buyerId];
    
    let transactionLock = await manager.findOne(TransactionLock, {
      where: {
        user_a_id: userAId,
        user_b_id: userBId,
        province: province,
      },
    });

    // If lock exists and already lit, don't count this transaction
    if (transactionLock && transactionLock.has_lit) {
      console.log(`Transaction between users ${buyerId} and ${sellerId} for province ${province} already counted`);
      return { lit: false, newProvince: false };
    }

    // Create or update transaction lock
    if (!transactionLock) {
      transactionLock = manager.create(TransactionLock, {
        user_a_id: userAId,
        user_b_id: userBId,
        province: province,
        has_lit: true,
        order_id: orderId,
      });
    } else {
      transactionLock.has_lit = true;
      transactionLock.order_id = orderId;
    }
    await manager.save(transactionLock);

    // Update buyer's footprint
    let footprint = await manager.findOne(UserFootprint, {
      where: {
        user_id: buyerId,
        province: province,
      },
    });

    let isNewProvince = false;

    if (!footprint) {
      // First time getting this province
      footprint = manager.create(UserFootprint, {
        user_id: buyerId,
        province: province,
        lit_status: true,
        lit_count: 1,
        first_lit_time: new Date(),
      });
      isNewProvince = true;
    } else if (!footprint.lit_status) {
      // Province exists but not lit yet
      footprint.lit_status = true;
      footprint.lit_count += 1;
      footprint.first_lit_time = new Date();
      isNewProvince = true;
    } else {
      // Province already lit, just increment count
      footprint.lit_count += 1;
    }

    await manager.save(footprint);

    // If new province was lit, update user's total provinces_lit and check for title promotion
    if (isNewProvince) {
      const user = await manager.findOne(User, { where: { id: buyerId } });
      if (user) {
        user.provinces_lit += 1;
        
        // Check for title promotion
        const newTitle = await this.checkTitlePromotion(user.provinces_lit);
        if (newTitle && newTitle.level > user.title_level) {
          user.title_level = newTitle.level;
          console.log(`User ${buyerId} promoted to level ${newTitle.level}: ${newTitle.name}`);
        }
        
        await manager.save(user);
      }
    }

    return { lit: true, newProvince: isNewProvince };
  }

  /**
   * Check if user should be promoted to a new title level
   * Levels: Lv.1 (3 provinces), Lv.2 (10), Lv.3 (20), Lv.4 (30)
   */
  async checkTitlePromotion(provincesLit: number): Promise<Title | null> {
    const titles = await this.titlesRepository.find({
      order: { level: 'DESC' },
    });

    for (const title of titles) {
      if (provincesLit >= title.required_provinces) {
        return title;
      }
    }

    return null;
  }

  /**
   * Get user's map progress
   */
  async getUserMapProgress(userId: number): Promise<{
    user: User;
    footprints: UserFootprint[];
    currentTitle: Title;
    nextTitle: Title | null;
    progress: number;
  }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const footprints = await this.footprintsRepository.find({
      where: { user_id: userId, lit_status: true },
      order: { first_lit_time: 'ASC' },
    });

    const currentTitle = await this.titlesRepository.findOne({
      where: { level: user.title_level },
    });

    const nextTitle = await this.titlesRepository.findOne({
      where: { level: user.title_level + 1 },
    });

    let progress = 0;
    if (nextTitle) {
      progress = (user.provinces_lit / nextTitle.required_provinces) * 100;
    }

    return {
      user,
      footprints,
      currentTitle,
      nextTitle,
      progress: Math.min(progress, 100),
    };
  }

  /**
   * Get all available titles
   */
  async getAllTitles(): Promise<Title[]> {
    return await this.titlesRepository.find({
      order: { level: 'ASC' },
    });
  }

  /**
   * Get lit provinces for a user
   */
  async getLitProvinces(userId: number): Promise<string[]> {
    const footprints = await this.footprintsRepository.find({
      where: { user_id: userId, lit_status: true },
    });

    return footprints.map(f => f.province);
  }
}
