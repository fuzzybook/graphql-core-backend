import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  nickname?: string;
  @Column({ nullable: true })
  title?: string;
  @Column({ nullable: true })
  firstName?: string;
  @Column({ nullable: true })
  lastName?: string;
  @Column({ nullable: true })
  phoneNumber?: string;
  @Column({ nullable: true })
  mobileNumber?: string;
  @Column({ nullable: true })
  address1?: string;
  @Column({ nullable: true })
  address2?: string;
  @Column({ nullable: true })
  zip?: string;
  @Column({ nullable: true })
  city?: string;
  @Column({ nullable: true })
  country?: string;
}
