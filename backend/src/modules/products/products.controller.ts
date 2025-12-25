import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductType } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(@Body() productData: any) {
    return await this.productsService.createProduct(productData.userId, productData);
  }

  @Get()
  async getProducts(
    @Query('type') type?: ProductType,
    @Query('province') province?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.productsService.getProducts({ type, province, page, limit });
  }

  @Get(':id')
  async getProductById(@Param('id') id: number) {
    return await this.productsService.getProductById(id);
  }

  @Get('user/:userId')
  async getUserProducts(@Param('userId') userId: number) {
    return await this.productsService.getUserProducts(userId);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateData: any,
  ) {
    return await this.productsService.updateProduct(id, updateData.userId, updateData);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: number, @Body('userId') userId: number) {
    return await this.productsService.deleteProduct(id, userId);
  }
}
