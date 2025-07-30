// src/appointment/appointment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PatientService } from '../patient/patient.service'; // Adjust path if needed
import { UpdateAvailabilityDTO } from 'src/doctor/dto/update-availability.dto'; // Not used here, but kept for context

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>, // This is private, correctly!
    private readonly patientService: PatientService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, doctorId: number, userId: number): Promise<Appointment> {
    const patient = await this.patientService.findOneByUserId(userId);
    if (!patient) {
      throw new NotFoundException(`Patient profile not found for user ID: ${userId}`);
    }
    const newAppointment = this.appointmentsRepository.create({
      doctorId: doctorId,
      bookingDate: createAppointmentDto.bookingDate,
      bookingTime: createAppointmentDto.bookingTime,
      consultingday: createAppointmentDto.consultingday,
      userId: userId,
      patientId: patient.id,
    });

    return this.appointmentsRepository.save(newAppointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find();
  }

  async findOneByDoctorAndDate(id : number , date : string){
    const found = await this.appointmentsRepository.find({where : {doctorId : id , bookingDate : date}});
    if(!found || found.length === 0){ // Added length check
      throw new NotFoundException('No appointments found for this doctor and date'); // More specific message
    }
    return found;
  }

  async updateOne(Id : number , status : string){
    let found = await this.appointmentsRepository.findOneBy({id : Id});
    if(!found){
      throw new NotFoundException(`Appointment with ID ${Id} not found.`);
    }
    found.status = status as AppointmentStatus;
    return await this.appointmentsRepository.save(found);
  }

  // --- NEW METHOD TO UPDATE BOOKING TIME AND STATUS ---
  async updateBookingDetails(id: number, newBookingTime: string, newStatus: AppointmentStatus): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOneBy({ id });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found for update.`);
    }
    appointment.bookingTime = newBookingTime;
    appointment.status = newStatus;
    return this.appointmentsRepository.save(appointment);
  }
  // --- END NEW METHOD ---

  async findByStatus(status: AppointmentStatus, doc_id: number, date: string) {
  return this.appointmentsRepository.find({
      where: { status: status, doctorId: doc_id, bookingDate: date }
    });
  } 


  async save(appointment: Appointment): Promise<Appointment> {
  return this.appointmentsRepository.save(appointment);
  }

}