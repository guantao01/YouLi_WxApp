import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum ProductType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  BLINDBOX = 'blindbox',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'varchar', length: 50 })
  province: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: ProductType, default: ProductType.SALE })
  type: ProductType;

  @Column({ type: 'int', default: 1 })
  stock: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
