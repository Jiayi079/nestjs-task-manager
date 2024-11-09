import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../event.entity';
import { User } from '../user.entity';

// inject the repository and define CRUD methods
@Injectable()
export class EventService {

    // constructor injects both 'eventRepository' for Event entity and 'userRepository' for User entity
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    // create() method used to save the event data to eventRepository
    async create(eventData: Partial<Event>): Promise<Event> {
        return this.eventRepository.save(eventData);
    }

    // findOne() method used to retrieves a single event by ID and includes invitees relation
    async findOne(id: number): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['invitees'],
        });
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }

    // findAll() method used to retrieves all events, including related invitees
    async findAll(): Promise<Event[]> {
        return this.eventRepository.find({
            relations: ['invitees'],
        });
    }

    // update() method used to updates an event by ID and returns the updated event
    async update(id: number, updateData: Partial<Event>): Promise<Event | null> {
        await this.eventRepository.update(id, updateData);
        return this.findOne(id);
    }

    // remove() method used to deletes an event by ID
    async remove(id: number): Promise<void> {
        const result = await this.eventRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
    }

    // mergeAllOverlappingEvents() method used to retrieves all events for a specified user, ordered by startTime
    async mergeAllOverlappingEvents(userId: number): Promise<Event[]> {
        // retrieve all events for the user
        const events = await this.eventRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.invitees', 'user')
            .where('user.id = :userId', { userId })
            .orderBy('event.startTime', 'ASC')
            .getMany();

        const mergedEvents: Event[] = [];
        let currentMergedEvent = null;

        // iterates through events to merge overlapping ones
        for (const event of events) {
            // check if events overlap and mergeEvents to merge them
            if (currentMergedEvent && this.isOverlapping(currentMergedEvent, event)) {
                currentMergedEvent = this.mergeEvents(currentMergedEvent, event);
            } else {
                // push the previous merged event and start a new one
                if (currentMergedEvent) {
                    mergedEvents.push(currentMergedEvent);
                }
                currentMergedEvent = event;
            }
        }

        // add the last merged event
        if (currentMergedEvent) {
            mergedEvents.push(currentMergedEvent);
        }

        // save merged events and delete original events
        await this.eventRepository.save(mergedEvents);
        await this.removeOriginalEvents(events, mergedEvents);

        return mergedEvents;
    }

    // isOverlapping() method used to checks if two events overlap.
    private isOverlapping(event1: Event, event2: Event): boolean {
        return event1.endTime > event2.startTime && event1.startTime < event2.endTime;
    }

    // mergeEvents() method used to merges two overlapping events by 
    // adjusting startTime, endTime, and concatenating title and description
    private mergeEvents(event1: Event, event2: Event): Event {
        event1.startTime = new Date(Math.min(event1.startTime.getTime(), event2.startTime.getTime()));
        event1.endTime = new Date(Math.max(event1.endTime.getTime(), event2.endTime.getTime()));
        event1.title = `${event1.title}, ${event2.title}`;
        event1.description = `${event1.description || ''} ${event2.description || ''}`;
        event1.status = 'IN_PROGRESS';
        event1.invitees = Array.from(new Set([...event1.invitees, ...event2.invitees]));

        return event1;
    }

    // removeOriginalEvents() method used to delete the original events that were merged into new ones
    private async removeOriginalEvents(originalEvents: Event[], mergedEvents: Event[]): Promise<void> {
        const originalEventIds = originalEvents.map(event => event.id);
        const mergedEventIds = mergedEvents.map(event => event.id);

        // find events to delete (originals that were merged)
        const eventsToDelete = originalEventIds.filter(id => !mergedEventIds.includes(id));
        await this.eventRepository.delete(eventsToDelete);
    }
}