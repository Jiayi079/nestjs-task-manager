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
        // console.log('Creating event with data:', eventData);
        const savedEvent = await this.eventRepository.save(eventData);
        // console.log('Event saved:', savedEvent);
        return savedEvent;
    }

    // findOne() method used to retrieves a single event by ID and includes invitees relation
    async findOne(id: number): Promise<Event> {
        // console.log(`Finding event with ID: ${id}`);
        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['invitees'],
        });
        if (!event) {
            // console.log(`Event with ID ${id} not found.`);
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        // console.log('Event found:', event);
        return event;
    }

    // findAll() method used to retrieves all events, including related invitees
    async findAll(): Promise<Event[]> {
        // console.log('Retrieving all events...');
        const events = await this.eventRepository.find({ relations: ['invitees'] });
        // console.log('All events retrieved:', events);
        return events;
    }

    // update() method used to updates an event by ID and returns the updated event
    async update(id: number, updateData: Partial<Event>): Promise<Event | null> {
        // console.log(`Updating event with ID ${id} with data:`, updateData);
        await this.eventRepository.update(id, updateData);
        const updatedEvent = await this.findOne(id);
        // console.log('Event updated:', updatedEvent);
        return updatedEvent;
    }

    // remove() method used to deletes an event by ID
    async remove(id: number): Promise<void> {
        // console.log(`Deleting event with ID ${id}`);
        const result = await this.eventRepository.delete(id);
        if (result.affected === 0) {
            // console.log(`No event found with ID ${id} to delete.`);
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        // console.log(`Event with ID ${id} deleted.`);
    }


    // mergeAllOverlappingEvents() method used to retrieves all events for a specified user, ordered by startTime
    async mergeAllOverlappingEvents(userId: number): Promise<Event[]> {
        // console.log(`Merging overlapping events for user ID ${userId}`);
        const events = await this.eventRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.invitees', 'user')
            .where('user.id = :userId', { userId })
            .orderBy('event.startTime', 'ASC')
            .getMany();

        // console.log('Events before merging:', events);

        const mergedEvents: Event[] = [];
        let currentMergedEvent = null;

        for (const event of events) {
            if (currentMergedEvent && this.isOverlapping(currentMergedEvent, event)) {
                // console.log('Overlapping found. Merging events:', currentMergedEvent, event);
                currentMergedEvent = this.mergeEvents(currentMergedEvent, event);
                // console.log('Result of merging:', currentMergedEvent);
            } else {
                if (currentMergedEvent) {
                    mergedEvents.push(currentMergedEvent);
                }
                currentMergedEvent = event;
            }
        }

        if (currentMergedEvent) {
            mergedEvents.push(currentMergedEvent);
        }

        // console.log('Merged events:', mergedEvents);

        await this.eventRepository.save(mergedEvents);
        await this.removeOriginalEvents(events, mergedEvents);

        return mergedEvents;
    }

    // isOverlapping() method used to checks if two events overlap.
    private isOverlapping(event1: Event, event2: Event): boolean {
        const isOverlap = event1.endTime > event2.startTime && event1.startTime < event2.endTime;
        // console.log('Checking overlap between:', event1, event2, 'Result:', isOverlap);
        return isOverlap;
    }

    // mergeEvents() method used to merges two overlapping events by 
    // adjusting startTime, endTime, and concatenating title and description
    private mergeEvents(event1: Event, event2: Event): Event {
        // console.log('Before merging:', event1.startTime, event1.endTime, event2.startTime, event2.endTime);
        event1.startTime = new Date(Math.min(event1.startTime.getTime(), event2.startTime.getTime()));
        event1.endTime = new Date(Math.max(event1.endTime.getTime(), event2.endTime.getTime()));
        event1.title = `${event1.title}, ${event2.title}`;
        event1.description = `${event1.description || ''} ${event2.description || ''}`;
        event1.status = 'IN_PROGRESS';
        event1.invitees = Array.from(new Set([...event1.invitees, ...event2.invitees]));
        // console.log('After merging:', event1);
        return event1;
    }

    // removeOriginalEvents() method used to delete the original events that were merged into new ones
    private async removeOriginalEvents(originalEvents: Event[], mergedEvents: Event[]): Promise<void> {
        const originalEventIds = originalEvents.map(event => event.id);
        const mergedEventIds = mergedEvents.map(event => event.id);
        const eventsToDelete = originalEventIds.filter(id => !mergedEventIds.includes(id));

        // console.log('Original event IDs:', originalEventIds);
        // console.log('Merged event IDs:', mergedEventIds);
        // console.log('Events to delete:', eventsToDelete);

        if (eventsToDelete.length > 0) {
            await this.eventRepository.delete(eventsToDelete);
            // console.log('Deleted original events that were merged:', eventsToDelete);
        }
    }
}