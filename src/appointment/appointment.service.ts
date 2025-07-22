import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PatientService } from '../patient/patient.service'; // Adjust path if needed

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private readonly patientService: PatientService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, userId: number): Promise<Appointment> {
    const patient = await this.patientService.findOneByUserId(userId);
    if (!patient) {
      throw new NotFoundException(`Patient profile not found for user ID: ${userId}`);
    }
    const newAppointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      userId: userId,
      patientId: patient.id, // Use the ID from the found patient profile
    });
    return this.appointmentsRepository.save(newAppointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find();
  }
}