import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDTO } from './dto/signUp.dto';
export declare class AuthService {
    private user;
    constructor(user: Repository<User>);
    create(body: SignUpDTO): Promise<User>;
    findByEmail(emailid: string): Promise<User[]>;
}
