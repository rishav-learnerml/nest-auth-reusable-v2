# Reusable NestJS Authentication Module

![NestJS Authentication](https://nestjs.com/img/logo_text.svg)

## Overview

Welcome to the **Reusable NestJS Authentication Module**! This project provides a robust and reusable authentication system built with [NestJS](https://nestjs.com/). It is designed to be modular, secure, and easy to integrate into any NestJS application.

### Branches

- **`master`**: Contains the core reusable authentication module.
- **`lms`**: Demonstrates the usage of the authentication module with a Learning Management System (LMS) example, including protected routes for managing courses.

---

## Features

- **JWT Authentication**: Secure token-based authentication.
- **Role-Based Access Control (RBAC)**: Protect routes based on user roles.
- **Refresh Tokens**: Seamless token renewal.
- **ValkeyDB Integration**: Token blacklisting for enhanced security.
- **Modular Design**: Easily integrate into any NestJS project.

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker (for running ValkeyDB and MongoDB)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rishav-learnerml/reusable-nest-auth.git
   cd reusable-nest-auth
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and configure the following:

   ```env
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=3d
   VALKEYDB_URL=redis://localhost:6379
   MONGO_URL=mongodb://localhost:27017
   ```

4. Start the services:

   ```bash
   docker-compose up -d
   ```

5. Run the application:
   ```bash
   yarn start:dev
   ```

---

## Usage

### Authentication Module

The `master` branch contains the reusable authentication module. You can integrate it into your NestJS application by importing the `AuthModule` and configuring it as needed.

### LMS Example

The `lms` branch demonstrates how to use the authentication module in a Learning Management System. It includes:

- **Courses Module**: Manage courses with protected routes.
- **Role-Based Guards**: Ensure only authorized users can access specific routes.

#### Example Protected Route

```typescript
@Get('courses')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
findAllCourses() {
  return this.courseService.findAll();
}
```

---

## Screenshots

### 1. Authentication Flow

![Authentication Flow](https://via.placeholder.com/800x400?text=Authentication+Flow)

### 2. Protected Routes

![Protected Routes](https://via.placeholder.com/800x400?text=Protected+Routes)

---

## Docker Setup

The `docker-compose.yml` file includes services for:

- **MongoDB**: Database for storing user and course data.
- **ValkeyDB**: Drop-in replacement for Redis, used for token blacklisting.

### Example Configuration

```yaml
services:
  mongo:
    image: mongo:latest
    container_name: mongo-nest-auth
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db

  valkeydb:
    image: valkeydb/valkeydb:latest
    container_name: valkeydb-nest-auth
    ports:
      - '6379:6379'
    environment:
      - VALKEYDB_PASSWORD=yourpassword

volumes:
  mongo-data:
```

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Contact

For any inquiries, feel free to reach out:

- **Author**: Rishav Chatterjee
- **GitHub**: [rishav-learnerml](https://github.com/rishav-learnerml)
- **Email**: rishav@example.com
# nest-auth-reusable-v2
