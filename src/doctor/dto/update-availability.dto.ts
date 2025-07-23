import { IsNumber, IsString } from 'class-validator';

export class UpdateAvailabilityDTO {
  @IsNumber()
  doctor_id: number;

  @IsString()
  start_time: string; // expect ISO string

  @IsString()
  end_time: string;   // expect ISO string
}
