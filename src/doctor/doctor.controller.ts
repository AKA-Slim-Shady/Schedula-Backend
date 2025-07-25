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
  async showSlots(
  @Param('id', ParseIntPipe) doc_id: number,
  @Query('date') bookingDate: string
  ) {
  if (!bookingDate) {
    return { error: 'Please provide bookingDate as query parameter, e.g. ?date=2025-08-04' };
  }
  return await this.doctorService.getFreeSlots(
    doc_id,
    bookingDate,
    this.appointmentService
  );
  }

  @Patch('updateAvailability/:id')
  async updateBasedOnDoctorAvailability(
  @Body() updateDTO: UpdateAvailabilityDTO,
  @Param('id', ParseIntPipe) doc_id: number,
  @Query('date') bookingdate: string
  ) {
    const updated = await this.doctorService.updateAvailability(doc_id, updateDTO);

    const updatedStart = updated.start_time; // Date objects (from DB, likely UTC)
    const updatedEnd = updated.end_time;

    const appointments = await this.appointmentService.findOneByDoctorAndDate(doc_id, bookingdate);

    let needChanges: {
      id: number;
      fullDateTime: string;
      bookingDate: string;
      bookingTime: string;
      reason: string;
    }[] = [];

    for (const appointment of appointments) {
      // Create Date object assuming bookingTime is IST (UTC+5:30)
      const appointmentDateTime = new Date(`${appointment.bookingDate}T${appointment.bookingTime}+05:30`);
      
      if (
        appointmentDateTime < updatedStart ||
        appointmentDateTime > updatedEnd
      ) {
        needChanges.push({
          id: appointment.id,
          fullDateTime: appointmentDateTime.toISOString(), // This will be the UTC ISO string
          bookingDate: appointment.bookingDate,
          bookingTime: appointment.bookingTime,
          reason: `Outside availability window: ${updatedStart.toISOString()} - ${updatedEnd.toISOString()}`
        });
        // Ensure status is updated to 'rescheduled' immediately
        await this.appointmentService.updateOne(appointment.id, 'rescheduled');
      }
    }
    return needChanges;
  }

  @Post('rescheduleAffected')
  async reschedule(
  @Query('date') bookingDate: string,
  @Query('id', ParseIntPipe) doc_id: number, // Use ParseIntPipe
  @Query('status') statusRaw: string,
  ) {
    const doctorId = doc_id; // Already parsed by ParseIntPipe
    const status = statusRaw.toLowerCase() as AppointmentStatus;
    
    const affected = await this.appointmentService.findByStatus(status , doctorId , bookingDate);
    
    const timeSlots = await this.doctorService.getFreeSlots(doctorId , bookingDate , this.appointmentService);
    
    let success: {
      appointmentId: number;
      originalTime: string;
      reassignedTime: string;
    }[] = [];

    let failure: {
      appointmentId: number;
      reason: string;
    }[] = [];


    for (let appointment of affected) {
      // Create appointmentTime Date object, explicitly specify IST timezone
      const appointmentTime = new Date(`${bookingDate}T${appointment.bookingTime}+05:30`);
      
      let closest: string | null = null;
      let minDiff = Number.POSITIVE_INFINITY;

      for (let slot of timeSlots) {
        // Create slotTime Date object, explicitly specify IST timezone for slots too
        const slotTime = new Date(`${bookingDate}T${slot}+05:30`);
        
        const diff = Math.abs(slotTime.getTime() - appointmentTime.getTime()); // Comparison is now consistent (UTC vs UTC)

        if (diff < minDiff) {
          minDiff = diff;
          closest = slot;
        }
      }

      if (closest) {
        success.push({
          appointmentId: appointment.id,
          originalTime: appointment.bookingTime,
          reassignedTime: closest,
        });

        // Update appointment's bookingTime and status using the new service method
        try {
          await this.appointmentService.updateBookingDetails(appointment.id, closest, AppointmentStatus.CONFIRMED);
        } catch (error) {
          // Handle cases where update might fail (e.g., appointment not found, though unlikely here)
          failure.push({
            appointmentId: appointment.id,
            reason: `Failed to update appointment details: ${error.message || 'Unknown error'}`,
          });
          continue; // Move to the next appointment
        }
        const index = timeSlots.indexOf(closest);
        if (index > -1) timeSlots.splice(index, 1);
      } else {
        failure.push({
          appointmentId: appointment.id,
          reason: 'No available slot found',
        });
      }
    }

    return {
      updatedCount: success.length,
      failedCount: failure.length,
      reassigned: success,
      failed: failure
    };
  }
}