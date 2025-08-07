import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pgConfig } from 'db.config';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { PatientModule } from './patient/patient.module';
import { DoctorModule } from './doctor/doctor.module';
import { AppointmentModule } from './appointment/appointment.module';
import { NotificationServiceService } from './notification-service/notification-service.service';

@Module({
  imports: [TypeOrmModule.forRoot(pgConfig), AuthModule, PatientModule, DoctorModule, AppointmentModule],
  controllers: [AppController],
  providers: [AppService, NotificationServiceService],
})
export class AppModule {}
