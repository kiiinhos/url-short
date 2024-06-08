import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column()
  shortUrl: string;

  @ManyToOne(() => User, (user) => user.urls, { nullable: true })
  user: User | null;

  @Column({ default: 0 })
  clicks: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt?: Date | null;

  constructor() {
    this.id = 0;
    this.originalUrl = '';
    this.shortUrl = '';
    this.user = null;
    this.clicks = 0;
    this.createdAt = new Date();
    this.updatedAt = null;
    this.deletedAt = null;
  }
}
