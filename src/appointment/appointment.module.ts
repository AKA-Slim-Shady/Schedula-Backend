import { Module , forwardRef} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { PatientModule } from 'src/patient/patient.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports : [TypeOrmModule.forFeature([Appointment]) , forwardRef(() => PatientModule) ,
  JwtModule.register({
        secret: 'supersecretkey',
        signOptions: { expiresIn: '1d' },
      }),],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports : [AppointmentService]
})
export class AppointmentModule {}
