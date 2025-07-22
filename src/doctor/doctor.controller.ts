import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateAvailabilityDto } from './dto/availability.dto';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService , private readonly jwtService : JwtService) {}

  @Post('createDoctor')
  create(@Body() createDoctorDto: CreateDoctorDto , @Req() req : Request) {
    const token = req.cookies['jwt'];
    const decoded = this.jwtService.verify(token);
    const id = decoded.sub;
    if(decoded.role !== 'Doctor'){
      throw new UnauthorizedException();
    }
    return this.doctorService.create(createDoctorDto , id);
  }

  @Post('createAvailability/:id')
  createAvail(@Body() availabilityDTO : CreateAvailabilityDto , @Param('id') doc_id : string){
    return this.doctorService.createAvailability(availabilityDTO , parseInt(doc_id)); 
  }

  @Get()
  findAll() {
    return this.doctorService.findAll();
  }

  // show availability of the specified doctor id
  @Get('availability/:id')
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(+id);
  }

  // show all the appointments scheduled for a particular doctor id
  @Get('showAppointments/:id')
  showAppointments(@Param('id') id : string){
    return this.doctorService.showPatients(parseInt(id));
  }
}
