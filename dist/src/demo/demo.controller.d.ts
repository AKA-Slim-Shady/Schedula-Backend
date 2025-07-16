import { DemoDTO } from './dto/createDemodto';
import { DemoService } from './demo.service';
export declare class DemoController {
    private readonly demoService;
    constructor(demoService: DemoService);
    findAll(): string;
    findOne(id: any): Promise<void>;
    postOne(body: DemoDTO): Promise<DemoDTO & import("../entities/user.entity").User>;
}
