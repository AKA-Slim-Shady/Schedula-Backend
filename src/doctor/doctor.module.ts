import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { Doctor } from './entities/doctor.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { AppointmentModule } from 'src/appointment/appointment.module';

@Module({
  imports: [JwtModule.register({
          secret: 'supersecretkey',
          signOptions: { expiresIn: '1d' },
        }), TypeOrmModule.forFeature([Availability , Doctor , Appointment]) , AppointmentModule], 
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
