// src/appointment/appointment.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete , Req, UnauthorizedException, ParseIntPipe, Query, BadRequestException} from '@nestjs/common';
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
    const decoded = this.jwtService.verify(token);
    if(decoded.role !== 'Patient'){
      throw new UnauthorizedException('Only patients can access this endpoint');
    }
    try {
      const userId = decoded.sub; // Renamed 'id' to 'userId' for clarity
      return this.appointmentService.create(createAppointmentDto, doctorId, userId);
    } catch (error) {
      // Handle JWT verification errors (e.g., token expired, invalid)
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  // ... rest of your controller methods remain unchanged

  @Delete(':doctorId/:appointmentId')
  async deleteAppointment(
  @Param('doctorId', ParseIntPipe) doctorId: number,
  @Param('appointmentId', ParseIntPipe) appointmentId: number,
  @Query('date') bookingDate: string,
  @Req() req: Request,
  ) {
  const token = req.cookies['jwt'];
  const decoded = this.jwtService.verify(token);
  if(decoded.role !== 'Patient'){
    throw new UnauthorizedException('Only patients can access this endpoint');
  }
  if (!bookingDate) {
    throw new BadRequestException('Please provide bookingDate as a query parameter');
  }
  return await this.appointmentService.deleteAppointment(doctorId, appointmentId, bookingDate);
  }
}