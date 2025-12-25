import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WelfareService } from './welfare.service';
import { MissingChildStatus } from './missing-child.entity';

@Controller('welfare')
export class WelfareController {
  constructor(private readonly welfareService: WelfareService) {}

  /**
   * Public endpoint - get missing children list (read-only)
   */
  @Get('missing-children')
  async getMissingChildren(
    @Query('province') province?: string,
    @Query('status') status?: MissingChildStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.welfareService.getMissingChildren({ province, status, page, limit });
  }

  /**
   * Public endpoint - get missing child detail (for poster)
   */
  @Get('missing-children/:id')
  async getMissingChildById(@Param('id') id: number) {
    return await this.welfareService.getMissingChildById(id);
  }

  /**
   * Public endpoint - get statistics
   */
  @Get('statistics')
  async getStatistics() {
    return await this.welfareService.getStatistics();
  }

  /**
   * Admin only - create missing child record
   * Should be protected with admin authentication guard
   */
  @Post('admin/missing-children')
  // @UseGuards(AdminGuard) // TODO: Implement admin guard
  async createMissingChild(@Body() childData: any) {
    return await this.welfareService.createMissingChild(childData.adminId, childData);
  }

  /**
   * Admin only - update missing child record
   * Should be protected with admin authentication guard
   */
  @Put('admin/missing-children/:id')
  // @UseGuards(AdminGuard) // TODO: Implement admin guard
  async updateMissingChild(
    @Param('id') id: number,
    @Body() updateData: any,
  ) {
    return await this.welfareService.updateMissingChild(id, updateData.adminId, updateData);
  }
}
