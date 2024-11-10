import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from '../event.entity';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            mergeAllOverlappingEvents: jest.fn()
          },
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  // test checks if EventController is correctly defined
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // test creating a new task --> 
  // ensures that the POST /events route in EventController.createEvent calls EventService.create correctly
  it('should create a new event', async () => {
    const eventData: Partial<Event> = {
      title: 'New Event',
      status: 'TODO',
    };
    const creatorId = 1;
    const createdEvent = { id: 1, ...eventData, creator: { id: creatorId } } as Event;

    jest.spyOn(service, 'create').mockResolvedValue(createdEvent);

    const result = await controller.createEvent(eventData, creatorId);
    expect(result).toEqual(createdEvent);
    expect(service.create).toHaveBeenCalledWith(eventData, creatorId);
  });


  // test retrieving a task by ID --> 
  // ensures that the GET /events/:id route in EventController.getEvent correctly calls EventService.findOne with the given ID
  it('should get an event by id', async () => {
    const eventId = 1;
    const event = { id: eventId, title: 'Test Event' } as Event;
    jest.spyOn(service, 'findOne').mockResolvedValue(event);

    const result = await controller.getEvent(eventId);
    expect(result).toEqual(event);
    expect(service.findOne).toHaveBeenCalledWith(eventId);
  });

  // test to retrieve all events -->
  // 3nsures the GET /events route in EventController.getAllEvents calls EventService.findAll
  it('should get all events', async () => {
    const events = [
      { id: 1, title: 'Event 1' } as Event,
      { id: 2, title: 'Event 2' } as Event,
    ];
    jest.spyOn(service, 'findAll').mockResolvedValue(events);

    const result = await controller.getAllEvents();
    expect(result).toEqual(events);
    expect(service.findAll).toHaveBeenCalled();
  });

  // test delete an event by its ID --> 
  // ensures that the DELETE /events/:id route in EventController.deleteEvent correctly calls EventService.remove
  it('should delete an event by id', async () => {
    const eventId = 1;
    jest.spyOn(service, 'remove').mockResolvedValue(undefined);

    await controller.deleteEvent(eventId);
    expect(service.remove).toHaveBeenCalledWith(eventId);
  });

  // test for the updateEvent() method
  it('should update an event by ID', async () => {
    const eventId = 1;
    const updateData = {
      title: 'Updated Event',
      status: 'IN_PROGRESS' as 'IN_PROGRESS',
    };
    const updatedEvent = {
      id: eventId,
      title: 'Updated Event',
      status: 'IN_PROGRESS',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T12:00:00Z'),
      invitees: [],
    } as Event;

    jest.spyOn(service, 'update').mockResolvedValue(updatedEvent);

    const result = await controller.updateEvent(eventId, updateData);

    expect(result).toEqual(updatedEvent);
    expect(service.update).toHaveBeenCalledWith(eventId, updateData);
  });

  // test for the mergeEventsForUser() method
  it('should merge overlapping events for a user and return merged events', async () => {
    const userId = 1;
    const mergedEvents = [
      {
        id: 1,
        title: 'Merged Event 1',
        status: 'IN_PROGRESS',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T12:00:00Z'),
        invitees: [],
      },
      {
        id: 2,
        title: 'Merged Event 2',
        status: 'IN_PROGRESS',
        startTime: new Date('2024-01-02T10:00:00Z'),
        endTime: new Date('2024-01-02T12:00:00Z'),
        invitees: [],
      },
    ] as Event[];

    // mock the mergeAllOverlappingEvents method to return merged events
    jest.spyOn(service, 'mergeAllOverlappingEvents').mockResolvedValue(mergedEvents);

    const result = await controller.mergeEventsForUser(userId);

    // assert that the result matches the merged events
    expect(result).toEqual(mergedEvents);
    expect(service.mergeAllOverlappingEvents).toHaveBeenCalledWith(userId);
  });
});
