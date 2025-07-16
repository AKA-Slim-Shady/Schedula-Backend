import { Injectable } from '@nestjs/common';
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

  findOne(id: number) {
    return `This action returns a #${id} patient`;
  }

  update(id: number, updatePatientDto: UpdatePatientDto) {
    return `This action updates a #${id} patient`;
  }

  remove(id: number) {
    return `This action removes a #${id} patient`;
  }
}
