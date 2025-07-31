// src/doctor/doctor.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  Query,
  NotFoundException,
  ParseIntPipe // <--- ADD THIS IMPORT
} from '@nestjs/common';
import { Request } from 'express';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateAvailabilityDto } from './dto/availability.dto';
import { AppointmentService } from 'src/appointment/appointment.service';
import { UpdateAvailabilityDTO } from './dto/update-availability.dto';
import { Appointment, AppointmentStatus } from 'src/appointment/entities/appointment.entity';
import { NotificationServiceService } from 'src/notification-service/notification-service.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService , private readonly jwtService : JwtService , private readonly appointmentService : AppointmentService , private readonly notificationService : NotificationServiceService , private readonly userService : AuthService) {}

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
  async showSlots(
  @Param('id', ParseIntPipe) doc_id: number,
  @Query('date') bookingDate: string
  ) {
  if (!bookingDate) {
    return { error: 'Please provide bookingDate as query parameter, e.g. ?date=2025-08-04' };
  }
  const check = await this.doctorService.getStrategy(doc_id);
  if (check === 'wave') {
    return await this.doctorService.waveSlots(doc_id , bookingDate);
  } 
  else {
    return await this.doctorService.getFreeSlots(doc_id, bookingDate, this.appointmentService); 
  }
  }

  @Patch('updateAvailability/:id')
  async updateBasedOnDoctorAvailability(
  @Body() updateDTO: UpdateAvailabilityDTO,
  @Param('id', ParseIntPipe) doc_id: number,
  @Query('date') bookingdate: string
  ) {
    const updated = await this.doctorService.updateAvailability(doc_id, updateDTO);
    const newSlot = await this.doctorService.adjustSlotDynamically(doc_id , bookingdate)
    const changed = await this.doctorService.identifyAffected(updated , doc_id , bookingdate);
    return changed;
  }

  @Post('rescheduleAffected')
  async reschedule(
  @Query('date') bookingDate: string,
  @Query('id', ParseIntPipe) doc_id: number, 
  @Query('status') statusRaw: string
  ) {
  const strategy = await this.doctorService.getStrategy(doc_id);
  if (strategy === 'wave') {
    return await this.doctorService.waveBasedRescheduling(doc_id, bookingDate);
    } 
  else {
    return await this.doctorService.slotBasedRescheduling(doc_id, statusRaw, bookingDate);
    }
  }


  // endpoint to send emails , for each type of scheduling send different emails
  @Post('sendEmail')
  async sendEmail(@Query('id') doc_id: string, @Query('date') bookingDate: string) {
    const doctorId = parseInt(doc_id);
    const successSent: { sentEmails: any }[] = [];
    const status1 = 'RESCHEDULED'.toLowerCase() as AppointmentStatus;
    const rescheduled = await this.appointmentService.findByStatus(status1 , doctorId, bookingDate);
    if (rescheduled.length === 0) {
      console.log(`No appointments found with status 'rescheduled' for doctor ${doctorId} on ${bookingDate}.`);
    } 
    else {
      for (const appt of rescheduled) {
        const email = await this.userService.getEmailById(appt.userId);
        const sent = await this.notificationService.sendMailRescheduled(email, appt.bookingTime);
        successSent.push({ sentEmails: sent });
      }
    }

    const confirmed = await this.appointmentService.findByStatus(AppointmentStatus.CONFIRMED, doctorId, bookingDate);
    if (confirmed.length === 0) {
      console.log(`No appointments found with status 'confirmed' for doctor ${doctorId} on ${bookingDate}.`);
    } 
    else {
      for (const appt of confirmed) {
        const email = await this.userService.getEmailById(appt.userId);
        const sent = await this.notificationService.sendMailConfirmed(email, appt.bookingTime);
        successSent.push({ sentEmails: sent });
      }
    }

    if (successSent.length === 0) {
      throw new NotFoundException(`No appointments found with status 'confirmed' or 'rescheduled' for doctor ${doctorId} on ${bookingDate}.`);
    }

    return successSent;
  }
}

