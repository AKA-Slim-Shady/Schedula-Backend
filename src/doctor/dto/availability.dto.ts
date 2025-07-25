import { IsNumber, IsString, IsArray, ArrayNotEmpty, IsDate } from "class-validator";

export class CreateAvailabilityDto {
    @IsNumber()
    doctor_id: number;

    @IsNumber()
    time : number;
    
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    day_of_the_week: string[];

    @IsDate()
    start_time: Date;

    @IsDate()
    end_time: Date;
}
