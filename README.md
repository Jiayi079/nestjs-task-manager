# NestJS TypeScript Starter Project

This project is a NestJS-based API for managing events and users. It includes CRUD operations for tasks (events), functionality for handling event invitees, and a method to merge overlapping events for a user.

## Requirements

- Node.js (>= 14.x)
- NPM (>= 6.x)
- MySQL (ensure you have it installed and running for database connectivity)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Jiayi079/nestjs-task-manager.git
cd nestjs-task-manager
```

### 2. Install Dependencies

Use npm to install the project dependencies:

```bash
npm install
```

### 3. Configure Database

Make sure your MySQL database is set up. Update the database configuration in `app.module.ts` or set up environment variables for your MySQL database.

**Default Configuration** (found in `app.module.ts`):

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root123',
  database: 'nestjs_project',
  entities: [Event, User],
  synchronize: true, // Be cautious with synchronize in production!
}),
```

### 4. Running the Application

To start the application, use one of the following commands:

 - For development mode (with hot reload):
```bash
 npm run start:dev
 ```

 - For production mode:
 ```bash
 npm run start:prod
 ```

 - Standard start:
 ```bash
 npm run start
 ```

 Once started, the server will run at `http://localhost:3000` by default. You can access API endpoints using this URL.

## Testing

### 1. Run Tests

To run the automated tests and ensure everything works as expected:

```bash
npm test
```

### 2. Explanation of Tests
The tests are written in Jest and cover the following key functionalities of the application:

- **UserService Tests**:
  - Ensures that `UserService` is properly defined.
  - Tests that a new user can be created using `createUser` and that the returned user data matches expectations.
  - Verifies that all users can be retrieved using `findAll`.

- **EventService Tests**:
  - Confirms that `EventService` is properly defined.
  - Tests the creation of a new event to ensure it is saved to the database and that the returned event data is accurate.
  - Verifies that an event can be retrieved by ID, including related invitees.
  - Confirms that an event can be deleted by ID.
  - Tests that when creating an event with invitees, corresponding records are automatically generated in the `event_invitees_user` table, correctly linking invitees to the event.
  - Checks the `mergeAllOverlappingEvents` function to ensure that overlapping events for a user are identified, merged, and correctly saved, with invitees consolidated from the overlapping events.

- **UserController Tests**:
  - Ensures that `UserController` is properly defined.
  - Tests that `createUser` in `UserController` successfully calls `UserService` to create a new user.
  - Verifies that all users can be retrieved through `getAllUsers`.

- **EventController Tests**:
  - Confirms that `EventController` is properly defined.
  - Tests the creation of a new event using `createEvent`.
  - Ensures that an event can be retrieved by ID using `getEvent`.
  - Tests retrieving all events with `getAllEvents`.
  - Verifies that an event can be deleted by ID using `deleteEvent`.

These tests ensure that core functionalities—CRUD operations for users and events, invitee management, and merging overlapping events—are functioning as expected. Run these tests with `npm test` to validate the application’s behavior.



## API Endpoints
The main endpoints of the API are as follows:

- User Endpoints:

  - `POST /users`: Create a new user.
  - `GET /users`: Retrieve all users.


- Event Endpoints:

  - `POST /events`: Create a new event.
  - `GET /events/:id`: Retrieve an event by ID.
  - `GET /events`: Retrieve all events.
  - `PATCH /events/:id`: Update an event by ID.
  - `DELETE /events/:id`: Delete an event by ID.
  - `GET /events/merge/:userId`: Merge all overlapping events for a user (merges overlapping time intervals).

Use a tool like `Postman` or `curl` to test the endpoints manually.

## Project Structure
- **src/**: Main source code for the API.
  - **src/event/**: Contains code related to event management:
    - **event.entity.ts**: Defines the Event entity schema.
    - **event.service.ts**: Provides business logic for events, including CRUD and merge operations.
    - **event.controller.ts**: Handles incoming requests related to events and routes them to the service.
    - **event.controller.spec.ts** and **event.service.spec.ts**: Automated test cases for the Event controller and service.
  - **src/user/**: Contains code related to user management:
    - **user.entity.ts**: Defines the User entity schema.
    - **user.service.ts**: Provides business logic for user management.
    - **user.controller.ts**: Handles incoming requests related to users and routes them to the service.
    - **user.controller.spec.ts** and **user.service.spec.ts**: Automated test cases for the User controller and service.
  - **app.controller.ts** and **app.service.ts**: Contains additional logic for the root application.
  - **app.module.ts**: Root module that sets up the application, including TypeORM configuration.
  - **main.ts**: Entry point of the application, which bootstraps the NestJS server.
  
- **test/**: (Currently unused) Placeholder for separate test-related files if needed in the future.

