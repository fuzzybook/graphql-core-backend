import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// table session must not be exposed!

@Entity()
export class Session extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  email: string;
  @Column('text', { array: true, default: '{}' })
  roles: string[];
  @Column({ default: 0 })
  auth: number;
  @Column({ type: 'jsonb', nullable: true })
  extra: unknown;
  @Column({ type: 'timestamp', nullable: true })
  logout: Date;
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created: Date;
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated?: Date;
}
