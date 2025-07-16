//demo.controller
import { Controller, ParseBoolPipe, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Get , Post , Param , Body} from '@nestjs/common'
import { DemoDTO } from './dto/createDemodto';
import { DemoService } from './demo.service';

@Controller('demo')
export class DemoController {

  constructor(private readonly demoService: DemoService) {}

  @Get()
  findAll(){
    return 'HI WELCOME TO DEMO';
  }

  @Get(':id')
  findOne(@Param('id' , ParseIntPipe) id){
    return this.demoService.findOne(id);
  }

  @UsePipes(new ValidationPipe({whitelist : true}))
  @Post()
  postOne(@Body() body : DemoDTO){
    return this.demoService.create(body);
  }
}
