import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { ConfigModule , ConfigService } from "@nestjs/config";
import { User } from "src/entities/user.entity";
import { Patient } from "src/patient/entities/patient.entity";

export const pgConfig : PostgresConnectionOptions = {
    url : 'postgresql://neondb_owner:npg_P8J2hQLGCpXl@ep-muddy-mud-a1dspgrk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    type : 'postgres',
    port : 5432,
    entities : [User , Patient],
    synchronize : true
}