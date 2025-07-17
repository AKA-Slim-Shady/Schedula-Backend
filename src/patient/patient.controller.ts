import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Req, UnauthorizedException } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService ,
    private readonly jwtService : JwtService
  ) {}

  @UsePipes(new ValidationPipe())
  @Post('createPatientProfile')
  create(@Body() createPatientDto: CreatePatientDto , @Req() req: Request) {
    const token = req.cookies['jwt'];
    const decoded = this.jwtService.verify(token);
    console.log(decoded);
    if(decoded.role !== 'Patient'){
      return new UnauthorizedException();
    }
    const userID = decoded.sub;
    return this.patientService.create(createPatientDto , userID);
  }

  @Get('viewPatients')
  findAll() {
    return this.patientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(+id, updatePatientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(+id);
  }
}
