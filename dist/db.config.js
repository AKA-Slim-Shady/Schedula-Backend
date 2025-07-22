"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgConfig = void 0;
const user_entity_1 = require("./src/entities/user.entity");
const patient_entity_1 = require("./src/patient/entities/patient.entity");
const appointment_entity_1 = require("./src/appointment/entities/appointment.entity");
const doctor_entity_1 = require("./src/doctor/entities/doctor.entity");
const availability_entity_1 = require("./src/doctor/entities/availability.entity");
exports.pgConfig = {
    url: 'postgresql://neondb_owner:npg_P8J2hQLGCpXl@ep-muddy-mud-a1dspgrk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    type: 'postgres',
    port: 5432,
    entities: [user_entity_1.User, patient_entity_1.Patient, appointment_entity_1.Appointment, doctor_entity_1.Doctor, availability_entity_1.Availability],
    synchronize: true
};
//# sourceMappingURL=db.config.js.map