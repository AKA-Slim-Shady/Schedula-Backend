import {IsString} from "class-validator";

export class SignUpDTO{
    @IsString()
    email : string;
    
    @IsString()
    password: string;
    
    @IsString()
    role: string;
}