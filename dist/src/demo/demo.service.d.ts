import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { DemoDTO } from './dto/createDemodto';
export declare class DemoService {
    private demoRepo;
    constructor(demoRepo: Repository<User>);
    create(dto: DemoDTO): Promise<DemoDTO & User>;
    findOne(id: number): Promise<void>;
}
