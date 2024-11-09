import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class User {
    // Define 'id' column as the primary key and automatically generates a unique value for each record
    @PrimaryGeneratedColumn()
    id: number;

    // Define 'name' column that stores the user's name as a string
    @Column()
    name: string;

    // one-to-many relationship --> one user can create multiple events
    @OneToMany(() => Event, event => event.creator)
    createdEvents: Event[];

    // many-to-many relationship --> each user can be invited to multiple events
    @ManyToMany(() => Event, event => event.invitees)
    invitedEvents: Event[];
}

export default User;
