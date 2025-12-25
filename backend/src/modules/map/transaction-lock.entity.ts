import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('transaction_locks')
export class TransactionLock {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  user_a_id: number;

  @Column({ type: 'int', unsigned: true })
  user_b_id: number;

  @Column({ type: 'varchar', length: 50 })
  province: string;

  @Column({ type: 'boolean', default: false })
  has_lit: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true })
  order_id: number;

  @CreateDateColumn()
  created_at: Date;
}
