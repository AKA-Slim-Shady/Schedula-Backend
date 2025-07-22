import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreateAvailabilityDto } from './dto/availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Injectable()
export class DoctorService {

  constructor(@InjectRepository(Doctor) private DoctorRepository : Repository<Doctor> , 
              @InjectRepository(Availability) private AvailabilityRepository : Repository<Availability>,
              @InjectRepository(Appointment) private patientRepo : Repository<Appointment>){}

  async create(createDoctorDto: CreateDoctorDto , userID : number) {
    const newAppointment = this.DoctorRepository.create({
      ...createDoctorDto,
      user_id: userID
    });
    return this.DoctorRepository.save(newAppointment);
  }

  async createAvailability( availabilityDTO : CreateAvailabilityDto , doc_id : number){
    const newAvailability = this.AvailabilityRepository.create({
      ...availabilityDTO ,
      doctor_id : doc_id
    });
    return this.AvailabilityRepository.save(newAvailability); 
  }

  async findAll() {
    return await this.DoctorRepository.find();
  }

  async findOne(id: number) {
    const found = await this.AvailabilityRepository.find({where : {doctor_id : id}});
    if(!found){
      return NotFoundException
    }
    return found;
  }

  async showPatients(id : number){
    const found = await this.patientRepo.find({where : {doctorId : id}});
    if(!found){
      return NotFoundException;
    }
    return found;
  }
}
