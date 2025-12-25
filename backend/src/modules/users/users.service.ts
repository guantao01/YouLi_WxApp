import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByOpenid(openid: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { openid } });
  }

  async findById(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, userData);
    return await this.usersRepository.save(user);
  }

  /**
   * Real-name verification
   * In production, this should integrate with real ID verification APIs
   */
  async verifyRealName(userId: number, realName: string, idCard: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.real_name_verified) {
      throw new BadRequestException('Already verified');
    }

    // Validate ID card format (basic check)
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    if (!idCardRegex.test(idCard)) {
      throw new BadRequestException('Invalid ID card format');
    }

    // TODO: Integrate with real ID verification API
    // For now, we'll just mark as verified
    user.real_name = realName;
    user.id_card = idCard;
    user.real_name_verified = true;

    return await this.usersRepository.save(user);
  }

  async getUserProfile(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
