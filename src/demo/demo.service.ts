//demo.service
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { DemoDTO } from './dto/createDemodto';

@Injectable()
export class DemoService {
    constructor(@InjectRepository(User) private demoRepo : Repository<User>){}
    async create(dto : DemoDTO){
        return await this.demoRepo.save(dto);
    }

    async findOne(id : number){
        const obj = await this.demoRepo.findOne({where : {id,} , });
        if(!obj){
            throw new NotFoundException('');
        }
    }
}
