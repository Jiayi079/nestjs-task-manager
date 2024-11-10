import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';

@Injectable()
export class UserService {
  constructor(
    // Constructor injects userRepository, which is a TypeORM repository for the ‘User’ entity.
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  // create() method used to creates a new 'user' instance and saves the user to the database.
  async create(userData: Partial<User>): Promise<User> {
    // console.log('Creating a new user with data:', userData);
    const user = await this.userRepository.save(userData);
    // console.log('User created:', user);
    return user;
  }

  // findAll() method used to retrieves and returns all user records from the database.
  async findAll(): Promise<User[]> {
    // console.log('Fetching all users');
    const users = await this.userRepository.find();
    // console.log('Users found:', users);
    return users;
}
}