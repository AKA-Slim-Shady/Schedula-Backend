import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
export declare class PatientController {
    private readonly patientService;
    private readonly jwtService;
    constructor(patientService: PatientService, jwtService: JwtService);
    create(createPatientDto: CreatePatientDto, req: Request): Promise<import("./entities/patient.entity").Patient>;
    findAll(): Promise<import("./entities/patient.entity").Patient[]>;
    findOne(id: string): string;
    update(id: string, updatePatientDto: UpdatePatientDto): string;
    remove(id: string): string;
}
