import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PatientService {
  constructor(@InjectRepository(Patient) private patient : Repository<Patient>){}
  
  async create(createPatientDto: CreatePatientDto , userID : number) {
    let obj = await this.patient.create({...createPatientDto , user : {id : userID}});
    return await this.patient.save(obj);
  }

  async findAll() {
    return await this.patient.find();
  }
  async findOne(id: number) {
    const patient = await this.patient.findOneBy({ id: id });
    if (!patient) {
      throw new NotFoundException(`Patient with ID #${id} not found`);
    }
    return patient;
  }

  async findOneByUserId(userId: number): Promise<Patient> {
    const patient = await this.patient.findOneBy({
      user: {
        id: userId,
      },
    });
    if (!patient) {
      throw new NotFoundException(`Patient profile for user ID #${userId} not found`);
    }
    return patient;
  }
  
  update(id: number, updatePatientDto: UpdatePatientDto) {
    return `This action updates a #${id} patient`;
  }

  remove(id: number) {
    return `This action removes a #${id} patient`;
  }
}
