import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { User } from './user.entity';

@Entity()
export class Event {
    // id (unique identifier, auto-generated)
    @PrimaryGeneratedColumn()
    id: number;

    // title (string, required)
    @Column()
    @IsNotEmpty({ message: 'Title is required' })
    title: string;

    // description (string, optional)
    @Column({ nullable: true })
    description: string;

    // status (enum, required: ['TODO', 'IN_PROGRESS', 'COMPLETED'])
    @Column({ type: 'enum', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] })
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

    // createdAt (date, auto-generated)
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    // updatedAt (date, auto-generated)
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    // startTime
    @Column({ type: 'timestamp' })
    startTime: Date;

    // endTime
    @Column({ type: 'timestamp' })
    endTime: Date;

    // many-to-many relation --> each event can have multiple invitees
    @ManyToMany(() => User, user => user.invitedEvents)
    @JoinTable()
    invitees: User[];

    // many-to-one relation --> each event has one creator
    @ManyToOne(() => User, user => user.createdEvents)
    creator: User;
}

export default Event;
