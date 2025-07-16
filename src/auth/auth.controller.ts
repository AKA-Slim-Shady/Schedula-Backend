import { Controller, NotAcceptableException, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import {Get , Post , Patch , Delete , Body , Param , Res} from '@nestjs/common';
import { SignUpDTO } from './dto/signUp.dto';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService ,  private readonly jwtService : JwtService){}

    @UsePipes(new ValidationPipe({whitelist : true}))
    @Post('signup')
    create(@Body() body : SignUpDTO){
        return this.authService.create(body);
    }

    @Post('signin')
    async signin(@Body() body, @Res({ passthrough: true }) res: Response) {
    const userArray = await this.authService.findByEmail(body.email);
    const user = userArray[0];

    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
    return {
      message: 'Login successful',
      userId: user.id,
      role: user.role,
    };
}
}
