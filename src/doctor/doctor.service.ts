import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreateAvailabilityDto } from './dto/availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { Appointment, AppointmentStatus } from 'src/appointment/entities/appointment.entity';
import { UpdateAvailabilityDTO } from './dto/update-availability.dto';
import { AppointmentService } from 'src/appointment/appointment.service';
import { max } from 'class-validator';

@Injectable()
export class DoctorService {
  constructor(@InjectRepository(Doctor) private DoctorRepository : Repository<Doctor> , 
              @InjectRepository(Availability) private AvailabilityRepository : Repository<Availability>,
              @InjectRepository(Appointment) private patientRepo : Repository<Appointment> , 
              private readonly appointmentService : AppointmentService){}

  async create(createDoctorDto: CreateDoctorDto , userID : number) {
    const newAppointment = this.DoctorRepository.create({
      ...createDoctorDto,
      user_id: userID
    });
    return this.DoctorRepository.save(newAppointment);
  }

  async createAvailability( availabilityDTO : CreateAvailabilityDto , doc_id : number){
    const newAvailability = this.AvailabilityRepository.create({
      ...availabilityDTO ,
      doctor_id : doc_id
    });
    return this.AvailabilityRepository.save(newAvailability); 
  }

  async findAll() {
    return await this.DoctorRepository.find();
  }

  async findOne(id: number) {
    const found = await this.AvailabilityRepository.find({where : {doctor_id : id}});
    if(!found){
      return NotFoundException
    }
    return found;
  }

  async showPatients(id : number){
    const found = await this.patientRepo.find({where : {doctorId : id}});
    if(!found){
      throw new NotFoundException;
    }
    return found;
  }

  async updateAvailability(id: number, updateDTO: UpdateAvailabilityDTO) {
  const old = await this.AvailabilityRepository.findOneBy({ doctor_id: id });
  if (!old) {
    throw new NotFoundException();
  }

  old.doctor_id = updateDTO.doctor_id;
  old.start_time = new Date(updateDTO.start_time);
  old.end_time = new Date(updateDTO.end_time);

  return await this.AvailabilityRepository.save(old);
 }

 async getStrategy(doc_id: number): Promise<string> {
  const availability = await this.AvailabilityRepository.findOneBy({ doctor_id: doc_id });

  if (!availability) {
    throw new NotFoundException(`No availability found for doctor ID ${doc_id}`);
  }

  // Return strategy if exists, else 'stream' by default
  return availability.strategy || 'stream';
  }


 async getFreeSlots(
    doctorId: number,
    bookingDate: string, // YYYY-MM-DD
    appointmentService: AppointmentService
  ): Promise<string[]> {
    // Fetch existing appointments for the doctor on the given date
    const appointments = await appointmentService.findOneByDoctorAndDate(doctorId, bookingDate);

    // Fetch the doctor's general availability (start_time, end_time)
    const timingsArr = await this.findOne(doctorId);
    if (!timingsArr || timingsArr.length === 0) {
      throw new NotFoundException('No availability found for this doctor to generate slots.');
    }
    const timeSlotDurationMinutes =  timingsArr[0].updated_time ?? timingsArr[0].time;

    // Assuming timingsArr[0].start_time and end_time are UTC Date objects from DB.
    // We need to work with these in UTC.
    const doctorAvailabilityStartUTC = new Date(timingsArr[0].start_time);
    const doctorAvailabilityEndUTC = new Date(timingsArr[0].end_time);

    // Generate potential slots within the doctor's availability window (in UTC minutes)
    let potentialSlotsUTC: string[] = [];
    let currentTimeUTC = new Date(doctorAvailabilityStartUTC); // Start from the doctor's availability start
    
    // Loop until current time is beyond end time
    while (currentTimeUTC.getTime() < doctorAvailabilityEndUTC.getTime()) {
      // Format the current UTC time to HH:MM:SS for comparison
      const hour = currentTimeUTC.getUTCHours().toString().padStart(2, '0');
      const minute = currentTimeUTC.getUTCMinutes().toString().padStart(2, '0');
      potentialSlotsUTC.push(`${hour}:${minute}:00`);

      // Add slot duration to current time
      currentTimeUTC.setUTCMinutes(currentTimeUTC.getUTCMinutes() + timeSlotDurationMinutes);
    }
    
    // Get booked slots, converting their local time to UTC HH:MM:SS for consistent comparison
    const bookedSlotsUTC: string[] = appointments
      .map(app => {
        if (!app.bookingTime) return null;
        // Construct a Date object from bookingDate and bookingTime, assume it's IST (UTC+5:30)
        // Then convert it to UTC time string for comparison.
        const bookingDateTimeIST = new Date(`${bookingDate}T${app.bookingTime}+05:30`); 
        return bookingDateTimeIST.toISOString().slice(11, 19); // Extract HH:MM:SS from UTC ISO string
      })
      .filter(time => time !== null);

    // Filter out booked slots
    const freeSlotsUTC = potentialSlotsUTC.filter(slot => !bookedSlotsUTC.includes(slot));
    
    // Convert the UTC free slots back to IST HH:MM:SS format for the response, as bookingTime is IST
    const freeSlotsIST: string[] = freeSlotsUTC.map(utcTime => {
      const utcDate = new Date(`${bookingDate}T${utcTime}`); // Create a Date object in server's local (assumed IST)
      utcDate.setUTCHours(utcDate.getUTCHours()); // Ensure it's treated as UTC initially
      utcDate.setUTCMinutes(utcDate.getUTCMinutes()); // Set minutes directly
      // Adjust to IST
      utcDate.setHours(utcDate.getHours() + 5); // Add 5 hours for IST offset
      utcDate.setMinutes(utcDate.getMinutes() + 30); // Add 30 minutes for IST offset

      const hour = utcDate.getHours().toString().padStart(2, '0');
      const minute = utcDate.getMinutes().toString().padStart(2, '0');
      return `${hour}:${minute}:00`;
    });

    return freeSlotsIST;
  }

  async identifyAffected(updated : Availability , doc_id : number , bookingdate : string){
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
            appointmentDateTime >= updatedEnd
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

  async slotBasedRescheduling(doc_id : number , statusRaw : string , bookingDate : string){
    const doctorId = doc_id; // Already parsed by ParseIntPipe
    const status = statusRaw.toLowerCase() as AppointmentStatus;
    
    const affected = await this.appointmentService.findByStatus(status , doctorId , bookingDate);
    
    const timeSlots = await this.getFreeSlots(doctorId , bookingDate , this.appointmentService);
    
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

  async adjustSlotDynamically(doc_id: number, bookingdate: string) {
  const info = await this.AvailabilityRepository.findOneBy({ doctor_id: doc_id });
  if (!info) {
    throw new NotFoundException('Doctor availability not found');
  }

  const start = info.start_time.getTime();
  const end = info.end_time.getTime();

  const totalMinutes = (end - start) / (1000 * 60);
  const totalNumber = await this.appointmentService.findOneByDoctorAndDate(doc_id , bookingdate);
  const newSlot = Math.floor((totalMinutes / totalNumber.length));
  if (totalNumber.length === 0) {
  throw new BadRequestException('Cannot adjust slots dynamically with zero appointments');
  }
  info.updated_time = newSlot;
  const updated = await this.AvailabilityRepository.save(info);
  return updated;
  }

  async waveSlots(doc_id: number, bookingDate: string): Promise<string[]> {
  const availability = await this.AvailabilityRepository.findOneBy({ doctor_id: doc_id });
  if (!availability) throw new NotFoundException("Doctor availability not found");

  const startTime = new Date(availability.start_time); // UTC assumed
  const endTime = new Date(availability.end_time);
  const waveDuration = 30; // in minutes
  const maxPerWave = 3; // Max patients per wave

  // Generate wave blocks
  const waves: string[] = [];
  const current = new Date(startTime);
  while (current < endTime) {
    const hr = current.getUTCHours().toString().padStart(2, '0');
    const min = current.getUTCMinutes().toString().padStart(2, '0');
    waves.push(`${hr}:${min}:00`);
    current.setUTCMinutes(current.getUTCMinutes() + waveDuration);
  }

  // Fetch existing appointments for that day
  const appointments = await this.appointmentService.findOneByDoctorAndDate(doc_id, bookingDate);

  // Group appointments by wave start time
  const waveCount: Record<string, number> = {};
  for (let app of appointments) {
    if (!app.bookingTime) continue;
    // Convert to UTC
    const dateObj = new Date(`${bookingDate}T${app.bookingTime}+05:30`);
    const minutes = dateObj.getUTCMinutes();
    const waveStartMin = Math.floor(minutes / waveDuration) * waveDuration;
    const waveKey = `${dateObj.getUTCHours().toString().padStart(2, '0')}:${waveStartMin.toString().padStart(2, '0')}:00`;
    waveCount[waveKey] = (waveCount[waveKey] || 0) + 1;
  }

  // Filter available waves
  const freeWaveSlots = waves.filter(wave => {
    return !waveCount[wave] || waveCount[wave] < maxPerWave;
  });

  // Convert UTC wave slots to IST string (HH:MM:SS)
  const waveIST = freeWaveSlots.map(utcTime => {
    const dateUTC = new Date(`${bookingDate}T${utcTime}Z`);
    dateUTC.setMinutes(dateUTC.getMinutes() + 330); // +5:30 offset
    const hr = dateUTC.getHours().toString().padStart(2, '0');
    const min = dateUTC.getMinutes().toString().padStart(2, '0');
    return `${hr}:${min}:00`;
  });

  return waveIST;
  }

  async waveBasedRescheduling(doc_id: number, bookingDate: string) {
  const availability = await this.AvailabilityRepository.findOneBy({ doctor_id: doc_id });
  if (!availability) throw new NotFoundException("Doctor availability not found");

  const startTime = new Date(availability.start_time);
  const endTime = new Date(availability.end_time);
  const waveDuration = 30; // in minutes
  const maxPerWave = 3; // Max patients per wave

  // Step 1: Generate all possible wave slots in UTC
  const waveSlots: string[] = [];
  const curr = new Date(startTime);
  while (curr < endTime) {
    const hh = curr.getUTCHours().toString().padStart(2, '0');
    const mm = curr.getUTCMinutes().toString().padStart(2, '0');
    waveSlots.push(`${hh}:${mm}:00`);
    curr.setUTCMinutes(curr.getUTCMinutes() + waveDuration);
  }

  // Step 2: Count existing confirmed appointments in each wave
  const allAppointments = await this.appointmentService.findOneByDoctorAndDate(doc_id, bookingDate);
  const waveCount: Record<string, number> = {};

  for (let app of allAppointments) {
    if (!app.bookingTime) continue;
    const dateObj = new Date(`${bookingDate}T${app.bookingTime}+05:30`);
    const mins = dateObj.getUTCMinutes();
    const waveMin = Math.floor(mins / waveDuration) * waveDuration;
    const waveKey = `${dateObj.getUTCHours().toString().padStart(2, '0')}:${waveMin.toString().padStart(2, '0')}:00`;
    waveCount[waveKey] = (waveCount[waveKey] || 0) + 1;
  }

  // Step 3: Get all rescheduled appointments
  const affected = await this.appointmentService.findByStatus('rescheduled' as AppointmentStatus, doc_id, bookingDate);

  const success : {}[] = [];
  const failure : {}[] = [];

  for (let appointment of affected) {
    let assigned = false;
    for (const wave of waveSlots) {
      if ((waveCount[wave] || 0) < maxPerWave) {
        // Assign this appointment to this wave
        const waveUTC = new Date(`${bookingDate}T${wave}Z`);
        waveUTC.setMinutes(waveUTC.getMinutes() + 330); // Convert UTC to IST
        const hr = waveUTC.getHours().toString().padStart(2, '0');
        const min = waveUTC.getMinutes().toString().padStart(2, '0');
        const newTime = `${hr}:${min}:00`;

        try {
          let str = 'confirmed' as AppointmentStatus
          await this.appointmentService.updateBookingDetails(appointment.id, newTime, str);
          waveCount[wave] = (waveCount[wave] || 0) + 1;
          success.push({appointmentId: appointment.id,reassignedTime: newTime,});
          assigned = true;
          break;
        } catch (error) {
          failure.push({
            appointmentId: appointment.id,
            reason: `Failed to update booking: ${error.message || 'unknown'}`
          });
          assigned = true;
          break;
        }
      }
    }
    if (!assigned) {
      failure.push({
        appointmentId: appointment.id,
        reason: 'No wave slots available'
      });
    }
  }

  return {
    reassigned: success,
    failed: failure,
    updatedCount: success.length,
    failedCount: failure.length
  };
}

}
