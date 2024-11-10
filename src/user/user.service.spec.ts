import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // test to check if UserService is correctly defined
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // test case for the create() method
  it('should create a new user', async () => {
    const userData: Partial<User> = { name: 'Test User' };
    const savedUser = { id: 1, ...userData } as User;

    // mocking userRepository.save to return the saved user
    jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);

    const result = await service.create(userData);

    // assertions
    expect(result).toEqual(savedUser);
    expect(userRepository.save).toHaveBeenCalledWith(userData);
  });

  // test case for the findAll() method
  it('should retrieve all users', async () => {
    const users = [
      { id: 1, name: 'User 1' } as User,
      { id: 2, name: 'User 2' } as User,
    ];

    // mocking userRepository.find to return a list of users
    jest.spyOn(userRepository, 'find').mockResolvedValue(users);

    const result = await service.findAll();

    // assertions
    expect(result).toEqual(users);
    expect(userRepository.find).toHaveBeenCalled();
  });
});
