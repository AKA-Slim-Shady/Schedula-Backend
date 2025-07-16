import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
export declare class PatientService {
    private patient;
    constructor(patient: Repository<Patient>);
    create(createPatientDto: CreatePatientDto, userID: number): Promise<Patient>;
    findAll(): Promise<Patient[]>;
    findOne(id: number): string;
    update(id: number, updatePatientDto: UpdatePatientDto): string;
    remove(id: number): string;
}
