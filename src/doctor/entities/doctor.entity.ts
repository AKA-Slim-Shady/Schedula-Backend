import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Doctor {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    user_id : number;

    @Column()
    name : string;

    @Column()
    specialization : string;

    @Column()
    experience : string;
}
