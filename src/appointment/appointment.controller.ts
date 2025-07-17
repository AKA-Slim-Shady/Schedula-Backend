import { Controller, Get, Post, Body, Patch, Param, Delete , Req, UnauthorizedException} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService , private readonly jwtService : JwtService) {}
  
  @Post('bookAppointment')
  create(@Body() createAppointmentDto: CreateAppointmentDto , @Req() req : Request) {
    const token = req.cookies['jwt'];
    const decoded = this.jwtService.verify(token);
    const id = decoded.sub;
    if(decoded.role !== 'Patient'){
      throw new UnauthorizedException();
    }
    return this.appointmentService.create(createAppointmentDto , id);
  }

  @Get()
  findAll(@Req() req : Request) {
    const token = req.cookies['jwt'];
    const decoded = this.jwtService.verify(token);
    if(decoded.role !== 'Doctor'){
      throw new UnauthorizedException();
    }
    return this.appointmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(+id);
  }
}
