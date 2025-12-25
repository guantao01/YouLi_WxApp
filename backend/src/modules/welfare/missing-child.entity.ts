import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MissingChildStatus {
  MISSING = 'missing',
  FOUND = 'found',
  ARCHIVED = 'archived',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('missing_children')
export class MissingChild {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'date' })
  missing_date: Date;

  @Column({ type: 'varchar', length: 200 })
  missing_location: string;

  @Column({ type: 'varchar', length: 50 })
  province: string;

  @Column({ type: 'int', nullable: true })
  age_at_missing: number;

  @Column({ type: 'int', nullable: true })
  current_age: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photo: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  contact_info: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  case_number: string;

  @Column({ type: 'enum', enum: MissingChildStatus, default: MissingChildStatus.MISSING })
  status: MissingChildStatus;

  @Column({ type: 'int', unsigned: true, nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
