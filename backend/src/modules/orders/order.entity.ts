import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true })
  order_no: string;

  @Column({ type: 'int', unsigned: true })
  product_id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', unsigned: true })
  buyer_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ type: 'int', unsigned: true })
  seller_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @Column({ type: 'timestamp', nullable: true })
  payment_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  ship_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirm_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  auto_confirm_time: Date;

  @Column({ type: 'json', nullable: true })
  shipping_address: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shipping_no: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shipping_company: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  seller_province: string;

  @Column({ type: 'text', nullable: true })
  refund_reason: string;

  @Column({ type: 'text', nullable: true })
  arbitration_result: string;

  @Column({ type: 'boolean', default: false })
  map_lit_triggered: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
