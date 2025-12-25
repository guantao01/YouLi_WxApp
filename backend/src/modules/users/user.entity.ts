import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  openid: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  unionid: string;

  @Column({ type: 'varchar', length: 100 })
  nickname: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  real_name: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  id_card: string;

  @Column({ type: 'boolean', default: false })
  real_name_verified: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  province: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string;

  @Column({ type: 'tinyint', default: 1 })
  title_level: number;

  @Column({ type: 'int', default: 0 })
  provinces_lit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  frozen_balance: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
