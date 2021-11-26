import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { customAlphabet } from 'nanoid';

// table session must not be exposed!

export enum ValidationTokenType {
  register = 'Register',
  recoverPassword = 'RECOVERPASSWORD',
}

@Entity()
export class ValidationToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @Column()
  email: string;
  @Column()
  token: string;
  @Column()
  type: string;
  @Column({ type: 'timestamp', nullable: true })
  expire: Date;
  @Column({ type: 'timestamp', nullable: true })
  fired: Date;
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created: Date;
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated?: Date;

  public async generate(type: ValidationTokenType, email: string, userId: string, expire: number): Promise<string> {
    var date = new Date();
    date.setDate(date.getDate() + expire);

    const nanoid = customAlphabet('346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz', 32);
    const token = nanoid();
    const data = {
      type: type,
      email: email,
      userId: userId,
      token: token,
      expire: date,
    };

    const tk = ValidationToken.create(data);
    await tk.save();

    return token;
  }
}
