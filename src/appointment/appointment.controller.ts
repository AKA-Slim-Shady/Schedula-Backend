// src/appointment/appointment.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete , Req, UnauthorizedException, ParseIntPipe} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService , private readonly jwtService : JwtService) {}

  // Changed route to include doctorId in path, added @Param decorator
  @Post('bookAppointment/:doctorId')
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Param('doctorId', ParseIntPipe) doctorId: number, // Use ParseIntPipe for validation
    @Req() req: Request,
  ) {
    const token = req.cookies['jwt'];
    if (!token) { // Added basic check for token presence
      throw new UnauthorizedException('No token found');
    }
    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub; // Renamed 'id' to 'userId' for clarity
      if(decoded.role !== 'Patient'){
        throw new UnauthorizedException('Only patients can book appointments.');
      }
      return this.appointmentService.create(createAppointmentDto, doctorId, userId);
    } catch (error) {
      // Handle JWT verification errors (e.g., token expired, invalid)
      throw new UnauthorizedException('Invalid or expired token.');
    }
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

  // ... rest of your controller methods remain unchanged
}