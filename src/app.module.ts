import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// entity classes representing the tables in the database
import Event from './event.entity';
import User from './user.entity';
// main controller and service
import { AppController } from './app.controller';
import { AppService } from './app.service';
// services for handling event and user logic
import { EventService } from './event/event.service';
import { UserService } from './user/user.service';
// controllers for handling HTTP requests related to events and users
import { EventController } from './event/event.controller';
import { UserController } from './user/user.controller';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root123',
      database: 'nestjs_project',
      entities: [Event, User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Event, User]),
  ],
  controllers: [AppController, EventController, UserController],
  providers: [AppService, EventService, UserService],
})
export class AppModule { }
