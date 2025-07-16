import { IsNumber, IsString } from "class-validator";

export class CreatePatientDto {
    @IsString()
    name : string;
    
    @IsNumber()
    age : number;
    
    @IsString()
    gender : string;
}
