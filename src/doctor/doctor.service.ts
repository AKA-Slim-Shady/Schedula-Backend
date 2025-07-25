import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreateAvailabilityDto } from './dto/availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { UpdateAvailabilityDTO } from './dto/update-availability.dto';
import { AppointmentService } from 'src/appointment/appointment.service';

@Injectable()
export class DoctorService {

  constructor(@InjectRepository(Doctor) private DoctorRepository : Repository<Doctor> , 
              @InjectRepository(Availability) private AvailabilityRepository : Repository<Availability>,
              @InjectRepository(Appointment) private patientRepo : Repository<Appointment>){}

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
    const timeSlotDurationMinutes = timingsArr[0].time;

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
}
