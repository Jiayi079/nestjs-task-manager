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
  ) {}

  // create() method used to creates a new 'user' instance and saves the user to the database.
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  // findAll() method used to retrieves and returns all user records from the database.
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}