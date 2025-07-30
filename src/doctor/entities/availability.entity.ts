// src/availability/entities/availability.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, IsNull } from 'typeorm';

@Entity()
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctor_id: number;

  @Column() 
  time : number;

  @Column("text", { array: true })
  day_of_the_week: string[];

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column({ default: 5, nullable: true })
  updated_time: number;
}