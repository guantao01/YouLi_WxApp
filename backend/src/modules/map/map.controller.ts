import { Controller, Get, Param } from '@nestjs/common';
import { MapService } from './map.service';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  /**
   * Get user's map progress
   */
  @Get('progress/:userId')
  async getUserMapProgress(@Param('userId') userId: number) {
    return await this.mapService.getUserMapProgress(userId);
  }

  /**
   * Get all available titles
   */
  @Get('titles')
  async getAllTitles() {
    return await this.mapService.getAllTitles();
  }

  /**
   * Get lit provinces for a user
   */
  @Get('provinces/:userId')
  async getLitProvinces(@Param('userId') userId: number) {
    return await this.mapService.getLitProvinces(userId);
  }
}
