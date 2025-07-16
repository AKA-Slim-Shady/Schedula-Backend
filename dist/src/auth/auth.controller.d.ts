import { SignUpDTO } from './dto/signUp.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    create(body: SignUpDTO): Promise<import("../entities/user.entity").User>;
    signin(body: any, res: Response): Promise<{
        message: string;
        userId: number;
        role: string;
    }>;
}
