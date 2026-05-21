import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UnitMeasure } from '../../common/enums';
import { Movement } from '../../movements/entities/movement.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'enum', enum: UnitMeasure })
  unitMeasure: UnitMeasure;

  @Column()
  category: string;

  @Column({ type: 'int', default: 0 })
  minStock: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Movement, (movement) => movement.product)
  movements: Movement[];
}
