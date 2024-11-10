import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from '../event.entity';

// define the constructor and define CRUD endpoints
@Controller('events')
export class EventController {
    // 'EventService' is injected into the controller
    constructor(private readonly eventService: EventService) { }

    // define a POST endpoint at /events.
    // createEvent() method used to create a new event
    // request body: eventData
    // returns: the saved event
    @Post()
    async createEvent(@Body() eventData: Partial<Event>): Promise<Event> {
        // console.log('POST /events - Creating event with data:', eventData);
        const event = await this.eventService.create(eventData);
        // console.log('Event created and returned:', event);
        return event;
    }

    // define a GET endpoint at /events/:id
    // getEvent() method used to retrieve a specific event by ID
    // parameter: id
    // return: the event by ID
    @Get(':id')
    async getEvent(@Param('id') id: number): Promise<Event> {
        // console.log(`Retrieving event with ID: ${id}`);
        const event = await this.eventService.findOne(id);
        // console.log('Event retrieved:', event);
        return event;
    }

    // define a GET endpoint at /events.
    // getAllEvents() method used to retrieve all events
    // returns: array of events
    @Get()
    async getAllEvents(): Promise<Event[]> {
        // console.log('Retrieving all events');
        const events = await this.eventService.findAll();
        // console.log('All events retrieved:', events);
        return events;
    }

    // defines a PATCH endpoint at /events/:id 
    // updateEvent() method used to updates to an event
    // parameter: id
    // request body: updateData
    // return: updated event
    @Patch(':id')
    async updateEvent(@Param('id') id: number, @Body() updateData: Partial<Event>): Promise<Event> {
        // console.log(`Updating event with ID: ${id} with data:`, updateData);
        const updatedEvent = await this.eventService.update(id, updateData);
        // console.log('Event updated:', updatedEvent);
        return updatedEvent;
    }

    // defines a DELETE endpoint at /events/:id 
    // deleteEvent() method used to delete a specific event by ID
    // parameter: id
    @Delete(':id')
    async deleteEvent(@Param('id') id: number): Promise<void> {
        // console.log(`Deleting event with ID: ${id}`);
        await this.eventService.remove(id);
        // console.log(`Event with ID ${id} deleted successfully`);
    }

    // defines a GET endpoint at /events/merge/:userId.
    // mergeEventsForUser() method used to merge overlapping events for the specified user
    // parameter: userId
    // returns: the merged events
    @Get('merge/:userId')
    async mergeEventsForUser(@Param('userId') userId: number) {
        // console.log(`Merging overlapping events for user with ID: ${userId}`);
        const mergedEvents = await this.eventService.mergeAllOverlappingEvents(userId);
        // console.log('Merged events:', mergedEvents);
        return mergedEvents;
    }
}
