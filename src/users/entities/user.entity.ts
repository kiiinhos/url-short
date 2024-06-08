import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Url } from '../../urls/entities/url.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ length: 250 })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Url, (url) => url.user)
  urls?: Url[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      console.log('Hashing password...');
      this.password = await bcrypt.hash(this.password, 10);
      console.log('Senha hasheada:', this.password);
    }
  }

  constructor() {
    this.id = 0;
    this.email = '';
    this.password = '';
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
