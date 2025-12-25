import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('user_footprints')
export class UserFootprint {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  province: string;

  @Column({ type: 'boolean', default: false })
  lit_status: boolean;

  @Column({ type: 'int', default: 0 })
  lit_count: number;

  @Column({ type: 'timestamp', nullable: true })
  first_lit_time: Date;

  @UpdateDateColumn()
  last_updated: Date;

  @CreateDateColumn()
  created_at: Date;
}
