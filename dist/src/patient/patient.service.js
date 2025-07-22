"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const patient_entity_1 = require("./entities/patient.entity");
const typeorm_2 = require("typeorm");
let PatientService = class PatientService {
    patient;
    constructor(patient) {
        this.patient = patient;
    }
    async create(createPatientDto, userID) {
        let obj = await this.patient.create({ ...createPatientDto, user: { id: userID } });
        return await this.patient.save(obj);
    }
    async findAll() {
        return await this.patient.find();
    }
    async findOne(id) {
        const patient = await this.patient.findOneBy({ id: id });
        if (!patient) {
            throw new common_1.NotFoundException(`Patient with ID #${id} not found`);
        }
        return patient;
    }
    async findOneByUserId(userId) {
        const patient = await this.patient.findOneBy({
            user: {
                id: userId,
            },
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Patient profile for user ID #${userId} not found`);
        }
        return patient;
    }
    update(id, updatePatientDto) {
        return `This action updates a #${id} patient`;
    }
    remove(id) {
        return `This action removes a #${id} patient`;
    }
};
exports.PatientService = PatientService;
exports.PatientService = PatientService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PatientService);
//# sourceMappingURL=patient.service.js.map