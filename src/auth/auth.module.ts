import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import {JwtModule} from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy';

@Module({
  providers: [AuthService, JwtStrategy],
  controllers : [AuthController],
  imports : [TypeOrmModule.forFeature([User]) , 
  JwtModule.register({
      secret: 'supersecretkey',
      signOptions: { expiresIn: '1d' },
    }),],
  exports : [AuthService, JwtModule]
})
export class AuthModule {}
