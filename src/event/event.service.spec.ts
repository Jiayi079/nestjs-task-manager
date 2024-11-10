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
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // test to checks if EventService is correctly defined
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // test create a new event --> cerifies that EventService.create saves a new event to the database
  it('should create a new event', async () => {
    jest.spyOn(eventRepository, 'create').mockImplementation((data) => data as Event);

    const creatorId = 1;
    const eventData: Partial<Event> = {
      title: 'New Event',
      status: 'TODO' as 'TODO',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T12:00:00Z'),
      invitees: [
        { id: 1, name: 'User1', createdEvents: [], invitedEvents: [] } as User,
        { id: 2, name: 'User2', createdEvents: [], invitedEvents: [] } as User,
      ],
    };

    const creator = { id: creatorId, name: 'User1', createdEvents: [], invitedEvents: [] } as User;
    const savedEvent = { id: 1, ...eventData, creator } as Event;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(creator);
    jest.spyOn(userRepository, 'findByIds').mockResolvedValue(eventData.invitees); // Mock findByIds for invitees
    jest.spyOn(eventRepository, 'save').mockResolvedValue(savedEvent);

    const result = await service.create(eventData, creatorId);
    expect(result).toEqual(savedEvent);
    expect(eventRepository.save).toHaveBeenCalledWith({
      ...eventData,
      creator,
    });
  });

  // test to retrieve all events --> cerify EventService.findAll fetches all events with invitees
  it('should retrieve all events', async () => {
    const events = [
      { id: 1, title: 'Event 1', creator: { id: 1 }, invitees: [] } as Event,
      { id: 2, title: 'Event 2', creator: { id: 2 }, invitees: [] } as Event,
    ];

    jest.spyOn(eventRepository, 'find').mockResolvedValue(events);

    const result = await service.findAll();
    expect(result).toEqual(events);
    expect(eventRepository.find).toHaveBeenCalledWith({
      relations: ['creator', 'invitees'],
    });
  });

  // test deleting a task by ID --> verifies that EventService.remove deletes an event by ID using eventRepository.delete
  it('should delete an event by id', async () => {
    const eventId = 1;
    jest.spyOn(eventRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

    await service.remove(eventId);
    expect(eventRepository.delete).toHaveBeenCalledWith(eventId);
  });

  // test automatic generation in event_invitees_user table -->
  // verifies that EventService.create adds entries to the join table (event_invitees_user) when an event is created with invitees
  it('should automatically generate records in event_invitees_user table when creating an event with invitees', async () => {
    jest.spyOn(eventRepository, 'create').mockImplementation((data) => data as Event);

    const creator = { id: 1, name: 'User1' } as User;
    const user1 = { id: 1, name: 'User1', createdEvents: [], invitedEvents: [] } as User;
    const user2 = { id: 2, name: 'User2', createdEvents: [], invitedEvents: [] } as User;

    const eventData: Partial<Event> = {
      title: 'New Event',
      status: 'TODO' as 'TODO',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T12:00:00Z'),
      invitees: [user1, user2],
    };

    const savedEvent = { id: 1, ...eventData, creator } as Event;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(creator);
    jest.spyOn(userRepository, 'findByIds').mockResolvedValue([user1, user2]); // Mock findByIds for invitees
    jest.spyOn(eventRepository, 'save').mockResolvedValue(savedEvent);

    const result = await service.create(eventData, creator.id);

    expect(result.invitees).toHaveLength(2);
    expect(result.invitees).toContainEqual(user1);
    expect(result.invitees).toContainEqual(user2);
  });

  // test to checks if the mergeAllOverlappingEvents method correctly merges overlapping events for a specified user
  it('should merge all overlapping events for a user', async () => {
    const userId = 1;

    const event1 = {
      id: 1,
      title: 'Meeting 1',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      invitees: [],
      creator: { id: userId }
    } as Event;

    const event2 = {
      id: 2,
      title: 'Meeting 2',
      startTime: new Date('2024-01-01T10:30:00Z'),
      endTime: new Date('2024-01-01T11:30:00Z'),
      invitees: [],
      creator: { id: userId }
    } as Event;

    const mergedEvent = {
      id: 1,
      title: 'Meeting 1, Meeting 2',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:30:00Z'),
      invitees: [],
      creator: { id: userId }
    } as Event;

    jest.spyOn(eventRepository, 'createQueryBuilder').mockReturnValueOnce({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([event1, event2]),
    } as any);

    jest.spyOn(eventRepository, 'save').mockResolvedValue(mergedEvent);
    jest.spyOn(eventRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

    const result = await service.mergeAllOverlappingEvents(userId);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Meeting 1, Meeting 2');
    expect(result[0].startTime).toEqual(new Date('2024-01-01T10:00:00Z'));
    expect(result[0].endTime).toEqual(new Date('2024-01-01T11:30:00Z'));
  });

  // Test for updating an event by ID
  it('should update an event by ID', async () => {
    const eventId = 1;
    const existingEvent = {
      id: eventId,
      title: 'Original Event',
      status: 'TODO' as 'TODO',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T12:00:00Z'),
      invitees: [],
    } as Event;

    const updateData = {
      title: 'Updated Event',
      status: 'IN_PROGRESS' as 'IN_PROGRESS',
    };

    const updatedEvent = {
      ...existingEvent,
      ...updateData,
    };

    jest.spyOn(eventRepository, 'update').mockResolvedValue({ affected: 1 } as any);
    jest.spyOn(eventRepository, 'findOne').mockResolvedValueOnce(updatedEvent);

    const result = await service.update(eventId, updateData);

    expect(result).toEqual(updatedEvent);
    expect(eventRepository.update).toHaveBeenCalledWith(eventId, updateData);
    expect(eventRepository.findOne).toHaveBeenCalledWith({
      where: { id: eventId },
      relations: ['creator', 'invitees'],
    });
  });
});