// src/availability/entities/availability.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctor_id: number;

  @Column() // <--- Make it nullable temporarily
  time : number;

  @Column("text", { array: true })
  day_of_the_week: string[];

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;
}