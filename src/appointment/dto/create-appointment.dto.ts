import { IsNumber, IsString, IsDateString, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { Transform } from 'class-transformer'; // Import Transform
import { ConsultingDay } from "../entities/appointment.entity";

export class CreateAppointmentDto {
  @IsDateString()
  @IsNotEmpty()
  bookingDate: string; // ISO 8601 format: YYYY-MM-DD

  @IsString()
  @IsOptional() // Optional to support "Confirm time later"
  bookingTime?: string; // Format: HH:MM

  @IsEnum(ConsultingDay)
  @IsNotEmpty()
  consultingday : ConsultingDay;
}