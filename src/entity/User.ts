import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, Index} from "typeorm";
import {IsEmail} from "class-validator";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index('first_name_idx')
    @Column()
    firstName: string;

    @Index("last_name_idx")
    @Column()
    lastName: string;

    @Index('email_idx', {unique: true})
    @Column()
    @IsEmail()
    email: string;

    @Column()
    password: string;

    @Index('created_idx')
    @Column()
    created: number;

    @Column({
        nullable: true,
        default: 0,
    })
    updated: number;

    @Column({
        type: 'json',
    })
    roles: [string]

}
