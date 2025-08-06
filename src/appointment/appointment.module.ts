import { Module , forwardRef} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { PatientModule } from 'src/patient/patient.module';
import { DoctorModule } from '../doctor/doctor.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification-service/notification.module'; // adjust the path as needed


@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    forwardRef(() => PatientModule),
    forwardRef(() => DoctorModule),
    NotificationModule,
    AuthModule
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}

