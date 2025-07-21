import { IsNumber, IsString } from "class-validator";

export class CreateDoctorDto {
    @IsString()
    name: string;

    @IsString()
    specialization: string;

    @IsString()
    experience: string;
}
