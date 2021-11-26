import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Entity()
export class MailerResults extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  email: string;
  @Column('jsonb', { default: {} })
  info: SMTPTransport.SentMessageInfo;
  @Column('jsonb', { default: {} })
  params: { [key: string]: string };
  @Column()
  subject: string;
  @Column()
  file: string;
  @Column('text', { default: '' })
  text: string;
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created: Date;
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated?: Date;

  public async add(email: string, userId: string, info: SMTPTransport.SentMessageInfo): Promise<void> {
    const data = {
      email: email,
      userId: userId,
      info: info,
    };

    const result = MailerResults.create(data);
    await result.save();
  }
}
