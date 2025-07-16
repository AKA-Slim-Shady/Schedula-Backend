import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from "bcrypt";
import { Patient } from 'src/patient/entities/patient.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn() 
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @OneToMany(() => Patient , (Patient) => Patient.user)
  patients : Patient[];

  @BeforeInsert()
  async hashing(){
    this.password = await bcrypt.hash(this.password , 10);
  }
}
