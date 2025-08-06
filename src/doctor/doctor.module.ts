import { forwardRef, Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { Doctor } from './entities/doctor.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { NotificationServiceService } from 'src/notification-service/notification-service.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Availability, Doctor, Appointment, User]),

    // ✅ fix: use forwardRef to resolve circular dependency
    forwardRef(() => AppointmentModule),
    AuthModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService, NotificationServiceService, AuthService],
  exports: [DoctorService], // ✅ export service so AppointmentModule can use it
})
export class DoctorModule {}
