import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { ConfigModule , ConfigService } from "@nestjs/config";
import { User } from "src/entities/user.entity";
import { Patient } from "src/patient/entities/patient.entity";
import { Appointment } from "src/appointment/entities/appointment.entity";
import { Doctor } from "src/doctor/entities/doctor.entity";
import { Availability } from "src/doctor/entities/availability.entity";

export const pgConfig : PostgresConnectionOptions = {
    url : 'postgresql://neondb_owner:npg_P8J2hQLGCpXl@ep-muddy-mud-a1dspgrk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    type : 'postgres',
    port : 5432,
    entities : [User , Patient , Appointment , Doctor , Availability],
    synchronize : true
}