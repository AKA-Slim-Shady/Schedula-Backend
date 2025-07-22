import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ConsultingDay {
  MONDAY = 'Monday' , TUESDAY = 'Tuesday' , WEDNESDAY = 'Wednesday' , THURSDAY = 'Thursday' , FRIDAY = 'Friday' , SATURDAY = 'Saturday' , SUNDAY = 'Sunday'
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RESCHEDULED = 'rescheduled',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column({ name: 'patient_id' })
  patientId: number;

  @Column({ type: 'date', name: 'booking_date' })
  bookingDate: string;

  @Column({ type: 'time', name: 'booking_time', nullable: true })
  bookingTime: string;

  @Column({
    type: 'enum',
    enum: ConsultingDay,
    name: 'consulting_day',
  })
  consultingday: ConsultingDay;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}