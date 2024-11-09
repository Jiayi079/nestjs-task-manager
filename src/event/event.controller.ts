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
        return this.eventService.create(eventData);
    }

    // define a GET endpoint at /events/:id
    // getEvent() method used to retrieve a specific event by ID
    // parameter: id
    // return: the event by ID
    @Get(':id')
    async getEvent(@Param('id') id: number): Promise<Event> {
        return this.eventService.findOne(id);
    }

    // define a GET endpoint at /events.
    // getAllEvents() method used to retrieve all events
    // returns: array of events
    @Get()
    async getAllEvents(): Promise<Event[]> {
        return this.eventService.findAll();
    }

    // defines a PATCH endpoint at /events/:id 
    // updateEvent() method used to updates to an event
    // parameter: id
    // request body: updateData
    // return: updated event
    @Patch(':id')
    async updateEvent(@Param('id') id: number, @Body() updateData: Partial<Event>): Promise<Event> {
        return this.eventService.update(id, updateData);
    }

    // defines a DELETE endpoint at /events/:id 
    // deleteEvent() method used to delete a specific event by ID
    // parameter: id
    @Delete(':id')
    async deleteEvent(@Param('id') id: number): Promise<void> {
        return this.eventService.remove(id);
    }

    // defines a GET endpoint at /events/merge/:userId.
    // mergeEventsForUser() method used to merge overlapping events for the specified user
    // parameter: userId
    // returns: the merged events
    @Get('merge/:userId')
    async mergeEventsForUser(@Param('userId') userId: number) {
        return this.eventService.mergeAllOverlappingEvents(userId);
    }
}
