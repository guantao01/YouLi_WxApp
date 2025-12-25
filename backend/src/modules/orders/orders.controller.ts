import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create order with escrow payment
   */
  @Post()
  async createOrder(@Body() orderData: {
    buyerId: number;
    productId: number;
    shippingAddress: any;
  }) {
    return await this.ordersService.createOrder(
      orderData.buyerId,
      orderData.productId,
      orderData.shippingAddress,
    );
  }

  /**
   * Ship order (seller)
   */
  @Put(':id/ship')
  async shipOrder(
    @Param('id') id: number,
    @Body() shipData: {
      sellerId: number;
      shippingNo: string;
      shippingCompany: string;
      sellerProvince: string;
    },
  ) {
    return await this.ordersService.shipOrder(
      id,
      shipData.sellerId,
      shipData.shippingNo,
      shipData.shippingCompany,
      shipData.sellerProvince,
    );
  }

  /**
   * Confirm receipt (buyer)
   */
  @Put(':id/confirm')
  async confirmReceipt(
    @Param('id') id: number,
    @Body('buyerId') buyerId: number,
  ) {
    return await this.ordersService.confirmReceipt(id, buyerId);
  }

  /**
   * Request refund
   */
  @Post(':id/refund')
  async requestRefund(
    @Param('id') id: number,
    @Body() refundData: {
      userId: number;
      reason: string;
    },
  ) {
    return await this.ordersService.requestRefund(id, refundData.userId, refundData.reason);
  }

  /**
   * Process refund (admin only)
   */
  @Put(':id/process-refund')
  async processRefund(
    @Param('id') id: number,
    @Body() processData: {
      approved: boolean;
      arbitrationResult: string;
    },
  ) {
    return await this.ordersService.processRefund(id, processData.approved, processData.arbitrationResult);
  }

  /**
   * Get user orders
   */
  @Get('user/:userId')
  async getUserOrders(
    @Param('userId') userId: number,
    @Query('type') type: 'buyer' | 'seller',
  ) {
    return await this.ordersService.getUserOrders(userId, type);
  }

  /**
   * Get order detail
   */
  @Get(':id')
  async getOrderById(@Param('id') id: number) {
    return await this.ordersService.getOrderById(id);
  }
}
