import { IsNumber, IsString, IsDateString, IsEnum, IsNotEmpty, IsOptional } from "class-validator";

export enum ConsultingType {
  REGULAR = 'Regular',
  ONLINE = 'Online',
}

export class CreateAppointmentDto {
  @IsNumber()
  @IsNotEmpty()
  doctorId: number;

  @IsDateString()
  @IsNotEmpty()
  bookingDate: string; // ISO 8601 format: YYYY-MM-DD

  @IsString()
  @IsOptional() // Optional to support "Confirm time later"
  bookingTime?: string; // Format: HH:MM

  @IsEnum(ConsultingType)
  @IsNotEmpty()
  consultingType: ConsultingType; 
}