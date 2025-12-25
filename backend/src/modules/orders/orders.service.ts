import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { MapService } from '../map/map.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private dataSource: DataSource,
    private mapService: MapService,
    private paymentService: PaymentService,
  ) {}

  /**
   * Create order with escrow payment
   * Buyer's funds are frozen until order completion
   */
  async createOrder(buyerId: number, productId: number, shippingAddress: any): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get product and seller info
      const product = await this.productsRepository.findOne({
        where: { id: productId, status: 1 },
        relations: ['user'],
      });

      if (!product || product.stock < 1) {
        throw new BadRequestException('Product not available');
      }

      const buyer = await this.usersRepository.findOne({ where: { id: buyerId } });
      if (!buyer) {
        throw new NotFoundException('Buyer not found');
      }

      // Prevent self-trading
      if (product.user_id === buyerId) {
        throw new BadRequestException('Cannot buy your own product');
      }

      // Check buyer has sufficient balance
      if (buyer.balance < product.price) {
        throw new BadRequestException('Insufficient balance');
      }

      // Generate order number
      const orderNo = this.generateOrderNo();

      // Create order
      const order = this.ordersRepository.create({
        order_no: orderNo,
        product_id: productId,
        buyer_id: buyerId,
        seller_id: product.user_id,
        amount: product.price,
        status: OrderStatus.PENDING_PAYMENT,
        shipping_address: shippingAddress,
      });

      await queryRunner.manager.save(order);

      // Freeze buyer's funds (escrow mechanism)
      await this.paymentService.freezeFunds(buyerId, product.price, order.id, queryRunner);

      // Update product stock
      product.stock -= 1;
      if (product.stock === 0) {
        product.status = 3; // sold out
      }
      await queryRunner.manager.save(product);

      // Update order status to paid
      order.status = OrderStatus.PAID;
      order.payment_time = new Date();
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Ship order with logistics tracking
   */
  async shipOrder(orderId: number, sellerId: number, shippingNo: string, shippingCompany: string, sellerProvince: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, seller_id: sellerId, status: OrderStatus.PAID },
    });

    if (!order) {
      throw new NotFoundException('Order not found or cannot be shipped');
    }

    // Update order with shipping info
    order.status = OrderStatus.SHIPPED;
    order.ship_time = new Date();
    order.shipping_no = shippingNo;
    order.shipping_company = shippingCompany;
    order.seller_province = sellerProvince;

    // Set auto-confirm time (7 days from ship time)
    const autoConfirmTime = new Date();
    autoConfirmTime.setDate(autoConfirmTime.getDate() + 7);
    order.auto_confirm_time = autoConfirmTime;

    return await this.ordersRepository.save(order);
  }

  /**
   * Confirm receipt - triggers fund release and map lighting
   */
  async confirmReceipt(orderId: number, buyerId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.ordersRepository.findOne({
        where: { id: orderId, buyer_id: buyerId, status: OrderStatus.SHIPPED },
      });

      if (!order) {
        throw new NotFoundException('Order not found or cannot be confirmed');
      }

      // Update order status
      order.status = OrderStatus.COMPLETED;
      order.confirm_time = new Date();
      await queryRunner.manager.save(order);

      // Unfreeze and transfer funds to seller (escrow release)
      await this.paymentService.releaseFunds(
        order.buyer_id,
        order.seller_id,
        order.amount,
        order.id,
        queryRunner,
      );

      // Trigger map lighting logic
      if (!order.map_lit_triggered && order.seller_province) {
        await this.mapService.processMapLighting(
          order.buyer_id,
          order.seller_id,
          order.seller_province,
          order.id,
          queryRunner,
        );
        order.map_lit_triggered = true;
        await queryRunner.manager.save(order);
      }

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Auto-confirm orders after 7 days
   * Should be called by a scheduled task
   */
  async autoConfirmOrders(): Promise<void> {
    const now = new Date();
    const ordersToConfirm = await this.ordersRepository.find({
      where: { status: OrderStatus.SHIPPED },
    });

    for (const order of ordersToConfirm) {
      if (order.auto_confirm_time && order.auto_confirm_time <= now) {
        try {
          await this.confirmReceipt(order.id, order.buyer_id);
        } catch (error) {
          console.error(`Failed to auto-confirm order ${order.order_no}:`, error);
        }
      }
    }
  }

  /**
   * Request refund
   */
  async requestRefund(orderId: number, userId: number, reason: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only buyer can request refund, and order must be paid or shipped
    if (order.buyer_id !== userId) {
      throw new BadRequestException('Only buyer can request refund');
    }

    if (![OrderStatus.PAID, OrderStatus.SHIPPED].includes(order.status)) {
      throw new BadRequestException('Order status does not allow refund');
    }

    order.status = OrderStatus.REFUNDING;
    order.refund_reason = reason;

    return await this.ordersRepository.save(order);
  }

  /**
   * Process refund (admin arbitration)
   */
  async processRefund(orderId: number, approved: boolean, arbitrationResult: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.ordersRepository.findOne({
        where: { id: orderId, status: OrderStatus.REFUNDING },
      });

      if (!order) {
        throw new NotFoundException('Order not found or not in refunding status');
      }

      order.arbitration_result = arbitrationResult;

      if (approved) {
        // Refund to buyer
        await this.paymentService.refundFunds(order.buyer_id, order.amount, order.id, queryRunner);
        
        order.status = OrderStatus.REFUNDED;

        // Restore product stock
        const product = await this.productsRepository.findOne({ where: { id: order.product_id } });
        if (product) {
          product.stock += 1;
          product.status = 1; // back to available
          await queryRunner.manager.save(product);
        }
      } else {
        // Reject refund, continue with order
        if (order.ship_time) {
          order.status = OrderStatus.SHIPPED;
        } else {
          order.status = OrderStatus.PAID;
        }
      }

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: number, type: 'buyer' | 'seller'): Promise<Order[]> {
    const whereClause = type === 'buyer' ? { buyer_id: userId } : { seller_id: userId };
    return await this.ordersRepository.find({
      where: whereClause,
      relations: ['product', 'buyer', 'seller'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get order details
   */
  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['product', 'buyer', 'seller'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Generate unique order number
   */
  private generateOrderNo(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `YL${timestamp}${random}`;
  }
}
