import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissingChild, MissingChildStatus, Gender } from './missing-child.entity';

@Injectable()
export class WelfareService {
  constructor(
    @InjectRepository(MissingChild)
    private missingChildrenRepository: Repository<MissingChild>,
  ) {}

  /**
   * Get missing children list (public, read-only)
   * No UGC allowed - only CMS can create/update
   */
  async getMissingChildren(filters: {
    province?: string;
    status?: MissingChildStatus;
    page?: number;
    limit?: number;
  }): Promise<{ children: MissingChild[]; total: number }> {
    const { province, status = MissingChildStatus.MISSING, page = 1, limit = 20 } = filters;

    const query = this.missingChildrenRepository.createQueryBuilder('child')
      .where('child.status = :status', { status });

    if (province) {
      query.andWhere('child.province = :province', { province });
    }

    query.orderBy('child.missing_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [children, total] = await query.getManyAndCount();

    return { children, total };
  }

  /**
   * Get missing child detail (for poster generation)
   */
  async getMissingChildById(id: number): Promise<MissingChild> {
    const child = await this.missingChildrenRepository.findOne({ where: { id } });

    if (!child) {
      throw new NotFoundException('Missing child record not found');
    }

    return child;
  }

  /**
   * Create missing child record (CMS/Admin only)
   * Regular users CANNOT create - prevents UGC
   */
  async createMissingChild(adminId: number, childData: {
    name: string;
    gender: Gender;
    missing_date: Date;
    missing_location: string;
    province: string;
    age_at_missing?: number;
    current_age?: number;
    photo?: string;
    description?: string;
    contact_info?: string;
    case_number?: string;
  }): Promise<MissingChild> {
    // This method should only be accessible to admin users
    // In production, add proper admin authentication check
    
    const child = this.missingChildrenRepository.create({
      ...childData,
      created_by: adminId,
      status: MissingChildStatus.MISSING,
    });

    return await this.missingChildrenRepository.save(child);
  }

  /**
   * Update missing child record (CMS/Admin only)
   */
  async updateMissingChild(id: number, adminId: number, updateData: Partial<MissingChild>): Promise<MissingChild> {
    const child = await this.missingChildrenRepository.findOne({ where: { id } });

    if (!child) {
      throw new NotFoundException('Missing child record not found');
    }

    Object.assign(child, updateData);
    return await this.missingChildrenRepository.save(child);
  }

  /**
   * Get statistics for display
   */
  async getStatistics(): Promise<{
    total: number;
    missing: number;
    found: number;
  }> {
    const [total, missing, found] = await Promise.all([
      this.missingChildrenRepository.count(),
      this.missingChildrenRepository.count({ where: { status: MissingChildStatus.MISSING } }),
      this.missingChildrenRepository.count({ where: { status: MissingChildStatus.FOUND } }),
    ]);

    return { total, missing, found };
  }
}
