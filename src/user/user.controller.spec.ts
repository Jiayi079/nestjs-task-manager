import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../user.entity';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  // test checks if UserController is correctly defined
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // test checks if UserController.createUser can create a user.
  it('should create a new user', async () => {
    const userData = { name: 'John Doe' };
    const createdUser = { id: 1, ...userData } as User;

    // Mocking UserService.create to return the created user
    jest.spyOn(service, 'create').mockResolvedValue(createdUser);

    const result = await controller.createUser(userData);

    // Verifying the created user data matches the result
    expect(result).toEqual(createdUser);
    expect(service.create).toHaveBeenCalledWith(userData);
  });

  // test checks if UserController.getAllUsers successfully retrieves a list of users.
  it('should retrieve all users', async () => {
    const users = [
      { id: 1, name: 'John Doe' } as User,
      { id: 2, name: 'Jane Doe' } as User,
    ];

    // Mocking UserService.findAll to return a list of users
    jest.spyOn(service, 'findAll').mockResolvedValue(users);

    const result = await controller.getAllUsers();

    // Verify the result matches the mocked list of users
    expect(result).toEqual(users);
    expect(service.findAll).toHaveBeenCalled();
  });



});
