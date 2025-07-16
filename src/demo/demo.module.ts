import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DemoService } from './demo.service';

@Module({
  controllers: [DemoController],
  imports : [TypeOrmModule.forFeature([User])],
  providers : [DemoService]
})
export class DemoModule {}

