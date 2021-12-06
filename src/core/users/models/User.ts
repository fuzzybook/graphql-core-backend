import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { Profile } from './Profile';
import { ISocialsDataResponse, UserPreferences, UserStatus } from '../Responses';
import * as bcrypt from 'bcrypt';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  status: UserStatus;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column('text', { array: true, default: '{}' })
  roles: string[];
  @Column({ default: 0 })
  auth: number;
  @Column({
    type: 'jsonb',
    array: false,
    default: '{"useIdle":false, "idleTimeout": 0}',
    nullable: false,
  })
  public preferences!: UserPreferences;

  @Column({
    type: 'jsonb',
    array: false,
    default: '{}',
    nullable: false,
  })
  socials!: ISocialsDataResponse;

  @Column('text', { default: '' })
  extra: string;
  //TODO schema is unique or indexed
  @Column('text', { default: '' })
  extraSchema: string;
  @Column({ type: 'timestamp', nullable: true })
  activated: Date;
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created: Date;
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated?: Date;
  @OneToOne(() => Profile, { cascade: ['insert', 'update'] }) // specify inverse side as a second parameter
  @JoinColumn()
  profile: Profile;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
