import { User } from "src/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Patient {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    name : string;

    @Column()
    age : number;

    @Column()
    gender : string;

    @ManyToOne(() => User , (user) => user.patients)
    user : User;
}
