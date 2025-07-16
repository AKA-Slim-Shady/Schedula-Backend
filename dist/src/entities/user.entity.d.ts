import { Patient } from 'src/patient/entities/patient.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    role: string;
    patients: Patient[];
    hashing(): Promise<void>;
}
