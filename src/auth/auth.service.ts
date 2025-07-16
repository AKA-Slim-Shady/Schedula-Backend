import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDTO } from './dto/signUp.dto';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private user : Repository<User>){}
    
    async create(body : SignUpDTO){
        const newUser = await this.user.create(body);
        return await this.user.save(newUser);
    }

    async findByEmail(emailid : string){
        const obj = await this.user.find({where : {email : emailid}});
        if(!obj) throw new NotFoundException();
        else return obj;
    }
}
