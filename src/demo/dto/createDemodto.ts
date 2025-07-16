import { IsString } from 'class-validator';

export class DemoDTO {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  role: string;
}
