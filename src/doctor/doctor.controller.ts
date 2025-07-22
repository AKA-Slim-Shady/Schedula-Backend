import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, Query } from '@nestjs/common';
import { Request } from 'express';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateAvailabilityDto } from './dto/availability.dto';
import { AppointmentService } from 'src/appointment/appointment.service';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService , private readonly jwtService : JwtService , private readonly appointmentService : AppointmentService) {}

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

  @Get(':id/freeSlots')
  async showSlots(@Param('id') doc_id: string , @Query('date') bookingDate : string) {
    if (!bookingDate) {
    return { error: 'Please provide bookingDate as query parameter, e.g. ?date=2025-08-04' };
    }
    const timeSlot = 15; 
    const appointments = await this.appointmentService.findOneByDoctorAndDate(parseInt(doc_id) , bookingDate);
    const timings = await this.doctorService.findOne(parseInt(doc_id));
    console.log(appointments);
    if (!timings || timings.length === 0) {
      return { error: 'No availability found for this doctor.' };
    }
    let startString = timings[0].start_time;
    let endString = timings[0].end_time;
    let startDate = new Date(startString);
    let endDate = new Date(endString);
    let start = startDate.getUTCHours() * 60 + startDate.getUTCMinutes();
    let end = endDate.getUTCHours() * 60 + endDate.getUTCMinutes();
    let slots: string[] = [];
    for (let curr = start; curr < end; curr += timeSlot) {
      let h = Math.floor(curr / 60);
      let m = curr % 60;
      let slot = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push(slot);
    }
    const bookedSlots = appointments.map(app => app.bookingTime ? app.bookingTime.slice(0, 5) : null).filter(time => time !== null); 
    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));
    return availableSlots;
  }
}
