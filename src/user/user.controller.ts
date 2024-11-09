import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../user.entity';

@Controller('users')
export class UserController {
    // the 'UserService' is injected into the controller
    constructor(private readonly userService: UserService) { }

    // defines a POST endpoint at /users
    // createUser() method used to create a new user
    // request body: userData
    // return: the saved user object
    @Post()
    async createUser(@Body() userData: Partial<User>): Promise<User> {
        return this.userService.create(userData);
    }

    // defines a GET endpoint at /users
    // getAllUsers() method used to retrieve all users from the database
    // return: an array of users
    @Get()
    async getAllUsers(): Promise<User[]> {
        return this.userService.findAll();
    }
}
