// src/appointment/appointment.service.ts
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PatientService } from '../patient/patient.service'; // Adjust path if needed
import { UpdateAvailabilityDTO } from 'src/doctor/dto/update-availability.dto'; // Not used here, but kept for context
import { DoctorService } from 'src/doctor/doctor.service';
import { NotificationServiceService } from 'src/notification-service/notification-service.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AppointmentService {
  constructor(
  @InjectRepository(Appointment)
  private appointmentsRepository: Repository<Appointment>,

  private readonly patientService: PatientService,

  private readonly notificationService : NotificationServiceService,

  private readonly userService : AuthService,

  @Inject(forwardRef(() => DoctorService))
  private readonly doctorService: DoctorService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, doctorId: number, userId: number): Promise<Appointment> {
  const patient = await this.patientService.findOneByUserId(userId);
  if (!patient) {
    throw new NotFoundException(`Patient profile not found for user ID: ${userId}`);
  }

  const { bookingDate, bookingTime, consultingday } = createAppointmentDto;
  if (!bookingDate || !bookingTime || !consultingday) {
    throw new BadRequestException('Missing booking fields');
  }

  const normalizedBookingTime = bookingTime.padEnd(8, ':00');
  const validSlots = await this.doctorService.getFreeSlots(doctorId, bookingDate, this);

  if (!validSlots.includes(normalizedBookingTime)) {
    throw new BadRequestException('Selected slot is no longer available');
  }

  // Slot is available → proceed to book
  const newAppointment = this.appointmentsRepository.create({
    doctorId,
    bookingDate,
    bookingTime: normalizedBookingTime,
    consultingday,
    userId,
    patientId: patient.id,
    status: AppointmentStatus.CONFIRMED, // directly confirmed here
  });

  const saved = await this.appointmentsRepository.save(newAppointment);

  const email = await this.userService.getEmailById(userId);
  await this.notificationService.sendMailConfirmed(email, normalizedBookingTime);

  return saved;
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

  async deleteAppointment(doc_id : number , id : number , bookingDate : string){
    const deleted = await this.appointmentsRepository.delete({id : id , doctorId : doc_id});
    const changed = await this.doctorService.getStrategy(doc_id);
    if(changed === 'stream'){
      return await this.doctorService.slotBasedRescheduling(doc_id , 'rescheduled' as AppointmentStatus , bookingDate);
    }
    else{
      return await this.doctorService.waveBasedRescheduling(doc_id , bookingDate);
    }
  }

  async findActiveAppointmentsByDoctorAndDate(id: number, date: string) {
  return this.appointmentsRepository.find({
    where: {
      doctorId: id,
      bookingDate: date,
      status: In(['pending', 'confirmed', 'rescheduled']), 
    },
  });
  }
}