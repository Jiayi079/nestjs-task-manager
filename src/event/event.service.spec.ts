import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from '../event.entity';
import { User } from '../user.entity';


describe('EventService', () => {
  let service: EventService;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User)); // Add this line
  });

  // test to checks if EventService is correctly defined
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // test create a new event --> cerifies that EventService.create saves a new event to the database
  it('should create a new event', async () => {
    const eventData: Partial<Event> = {
      title: 'New Event',
      status: 'TODO',  // 'TODO' is now correctly typed as one of the allowed values
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T12:00:00Z'),
    };

    const savedEvent = { id: 1, ...eventData } as Event;
    jest.spyOn(eventRepository, 'save').mockResolvedValue(savedEvent);

    const result = await service.create(eventData);
    expect(result).toEqual(savedEvent);
    expect(eventRepository.save).toHaveBeenCalledWith(eventData);
  });

  // test retrieve a single event by its ID --> ensures EventService.findOne retrieves an event by ID, including related invitees
  it('should find an event by id', async () => {
    const eventId = 1;
    const foundEvent = { id: eventId, title: 'Existing Event' } as Event;
    jest.spyOn(eventRepository, 'findOne').mockResolvedValue(foundEvent);

    const result = await service.findOne(eventId);
    expect(result).toEqual(foundEvent);
    expect(eventRepository.findOne).toHaveBeenCalledWith({ where: { id: eventId }, relations: ['invitees'] });
  });

  // test to retrieve all events --> cerify EventService.findAll fetches all events with invitees
  it('should retrieve all events', async () => {
    const events = [
      { id: 1, title: 'Event 1', startTime: new Date('2024-01-01T10:00:00Z'), endTime: new Date('2024-01-01T12:00:00Z') } as Event,
      { id: 2, title: 'Event 2', startTime: new Date('2024-01-02T10:00:00Z'), endTime: new Date('2024-01-02T12:00:00Z') } as Event,
    ];

    // Mocking eventRepository.find to return a list of events
    jest.spyOn(eventRepository, 'find').mockResolvedValue(events);

    const result = await service.findAll();

    // Verify that the result matches the mocked events array
    expect(result).toEqual(events);
    expect(eventRepository.find).toHaveBeenCalledWith({
      relations: ['invitees'],
    });
  });

  // test deleting a task by ID --> verifies that EventService.remove deletes an event by ID using eventRepository.delete.
  it('should delete an event by id', async () => {
    const eventId = 1;
    jest.spyOn(eventRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

    await service.remove(eventId);
    expect(eventRepository.delete).toHaveBeenCalledWith(eventId);
  });

  // test automatic generation in event_invitees_user table -->
  // verifies that EventService.create adds entries to the join table (event_invitees_user) when an event is created with invitees
  it('should automatically generate records in event_invitees_user table when creating an event with invitees', async () => {
    const user1 = { id: 1, name: 'User1' } as User;
    const user2 = { id: 2, name: 'User2' } as User;

    // Mock repository find for users
    jest.spyOn(userRepository, 'findOne').mockImplementation((options: { where: { id: number } }) => {
      const { id } = options.where;
      return id === 1 ? Promise.resolve(user1) : Promise.resolve(user2);
    });

    const eventData = {
      title: 'New Event',
      status: 'TODO' as 'TODO', // Explicitly specify the type here
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T12:00:00Z'),
      invitees: [user1, user2], // Assign invitees
    };

    // Mock eventRepository save to return the event with invitees
    jest.spyOn(eventRepository, 'save').mockResolvedValue({ id: 1, ...eventData } as Event);

    const result = await service.create(eventData);

    // Verify the invitees are correctly linked to the event
    expect(result.invitees).toHaveLength(2);
    expect(result.invitees).toContainEqual(user1);
    expect(result.invitees).toContainEqual(user2);
  });

  // test to checks if the mergeAllOverlappingEvents method correctly merges overlapping events for a specified user
  it('should merge all overlapping events for a user', async () => {
    const userId = 1;

    // Mocked events with overlapping times
    const event1 = {
      id: 1,
      title: 'Meeting 1',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      invitees: [],
    } as Event;

    const event2 = {
      id: 2,
      title: 'Meeting 2',
      startTime: new Date('2024-01-01T10:30:00Z'), // Overlaps with event1
      endTime: new Date('2024-01-01T11:30:00Z'),
      invitees: [],
    } as Event;

    const mergedEvent = {
      id: 1,
      title: 'Meeting 1, Meeting 2',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:30:00Z'),
      invitees: [], // Combined invitees would be here
    } as Event;

    // Mocking the event repository behavior
    jest.spyOn(eventRepository, 'createQueryBuilder').mockReturnValueOnce({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([event1, event2]),
    } as any);

    jest.spyOn(eventRepository, 'save').mockResolvedValue(mergedEvent);
    jest.spyOn(eventRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

    const result = await service.mergeAllOverlappingEvents(userId);

    // Verifying the merged event properties
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Meeting 1, Meeting 2');
    expect(result[0].startTime).toEqual(new Date('2024-01-01T10:00:00Z'));
    expect(result[0].endTime).toEqual(new Date('2024-01-01T11:30:00Z'));
  });
});
