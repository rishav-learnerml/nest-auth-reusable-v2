# Reusable Nest Auth (v2)

![NestJS Authentication](https://nestjs.com/img/logo_text.svg)

## Overview

This repository provides a reusable authentication module and example API built with NestJS. It demonstrates a secure JWT-based auth system with access + refresh tokens (refresh stored in an HttpOnly cookie), role-based guards, OTP verification flows (email), Cloudinary profile image upload, and a basic courses example.

---

## Table of contents

- Project overview
- Quick start
- Environment variables
- Authentication overview
- Endpoints (grouped)
  - Public
  - Auth
  - User
  - Courses
  - Email
- DTOs and models
- Examples
- Notes & next steps

---

## Project overview

This project implements:

- JWT access tokens (Bearer) and refresh tokens stored as HttpOnly cookies
- Refresh token blacklist using Redis
- OTP generation for account verification and password reset (email delivery)
- Cloudinary image upload for profile pictures
- Role-based authorization (user, admin)
- Validation using class-validator and ValidationPipe

Tech stack: NestJS, Mongoose, Redis/ValkeyDB, Cloudinary, bcrypt, jsonwebtoken


## Quick start

1. Install dependencies

```bash
# using yarn (repo contains yarn lock)
yarn install
# or with npm
npm install
```

2. Provide environment variables (see next section)

3. Start the app

```bash
# development
yarn start:dev
# or
npm run start:dev
```

The server defaults to port 3000 or honors `PORT` environment variable.


## Environment variables

The application requires the following env vars (minimum):

- PORT (optional) — app port
- MONGODB_URI / MONGO_URL — MongoDB connection string
- JWT_SECRET — signing secret for access tokens
- JWT_SECRET_REFRESH — signing secret for refresh tokens
- JWT_SECRET_RESET — signing secret for password-reset tokens
- ACCESS_TOKEN_EXPIRY (optional) — e.g. `15m`
- REFRESH_TOKEN_EXPIRY (optional) — e.g. `3d`
- VALKEY_URL / VALKEYDB_URL / REDIS_URL (optional) — Redis/ValkeyDB URL, default: `redis://localhost:6379`
- CLOUDINARY_CLOUD_NAME — Cloudinary cloud name
- CLOUDINARY_API_KEY — Cloudinary API key
- CLOUDINARY_API_SECRET — Cloudinary API secret

Make sure Redis/ValkeyDB and MongoDB are running and reachable.


## Authentication overview

- Registration (`POST /auth/register`) stores a user and immediately issues an access token (returned in response) and a refresh token (HttpOnly cookie `refresh_token`). It also sends an OTP to the user's email to verify the account.

- Login (`POST /auth/login`) verifies credentials and issues new tokens (same behavior as registration).

- Access-protected routes require an `Authorization: Bearer <access_token>` header. The `AuthGuard` verifies the access token and attaches payload to `request.user`.

- Role-protected routes use the `@Roles(...)` decorator and `RolesGuard` to restrict access based on `user.role` (enum Role = `user | admin`).

- Refresh (`GET /auth/refresh`) reads `refresh_token` cookie, verifies it (and checks Redis blacklist), issues a new access token and sets a fresh refresh cookie.

- Logout (`GET /auth/logout`) blacklists the refresh token in Redis and clears the cookie.

- OTP flows:
  - Account verification: OTP sent on registration. Endpoint `POST /user/verify-otp` (protected) accepts `{ otp }`.
  - Resend OTP: `GET /user/resend-otp` (protected).
  - Forgot password: `POST /user/forgot-password` - sends a reset link (JWT token) to email.
  - Reset password: `POST /user/reset-password` with `{ token, password }` — token validated and password updated.


## Endpoints

Below are all endpoints discovered in the codebase with request/response shapes, guards and examples.

Base URL: http://localhost:3000 (adjust `PORT` as needed)


### Public

- GET /
  - Description: Simple health/hello route
  - Response: string


### Auth (prefix: `/auth`)

1) POST /auth/register
- Description: Register a new user. Accepts optional profile picture as multipart/form-data field `file`.
- Content-Type: multipart/form-data
- Request fields (body):
  - firstname (string, required)
  - lastname (string, required)
  - email (string, required, email)
  - password (string, required)
  - file (optional) — image file for profile picture
- Response (200):
  ```json
  {
    "message": "User registered successfully and OTP sent to email!",
    "access_token": "<jwt access token>"
  }
  ```
- Side effects:
  - Sets cookie `refresh_token` (HttpOnly)
  - Sends OTP email for verification

Example (curl multipart):

```bash
curl -v -X POST http://localhost:3000/auth/register \
  -F "firstname=Jane" \
  -F "lastname=Doe" \
  -F "email=jane@example.com" \
  -F "password=supersecret" \
  -F "file=@/path/to/avatar.jpg"
```

2) POST /auth/login
- Description: Login existing user
- Content-Type: application/json
- Request body:
  ```json
  { "email": "jane@example.com", "password": "supersecret" }
  ```
- Response:
  ```json
  {
    "message": "User logged in successfully!",
    "access_token": "<jwt access token>",
    "verified": true
  }
  ```
- Side effects:
  - Sets cookie `refresh_token` (HttpOnly)

Example (curl):

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"supersecret"}'
```

3) GET /auth/refresh
- Description: Refresh the access token using refresh cookie
- Notes: Reads `refresh_token` cookie. Returns new access token and sets a fresh refresh cookie.
- Request: Cookie must be sent by the client. Example with curl: `--cookie "refresh_token=<token>"`
- Response:
  ```json
  { "message": "Token refreshed successfully!", "access_token": "<jwt>" }
  ```

4) GET /auth/logout
- Description: Logout user — invalidates refresh token (blacklist in Redis) and clears cookie
- Request: reads `refresh_token` cookie
- Response: `{ "message": "User logged out successfully!" }`


### User (prefix: `/user`)
All user endpoints that modify or view user data require Authorization header (Bearer access token) via `AuthGuard` unless noted.

1) GET /user/profile
- Guards: AuthGuard
- Description: Fetch the logged-in user's profile (password excluded)
- Response:
  ```json
  { "message": "User profile fetched successfully", "user": {"_id":"...","firstname":"","lastname":"","email":"","profilePicId":"","role":"user","accountStatus":"unverified"} }
  ```

2) PATCH /user/update
- Guards: AuthGuard
- Description: Update the logged-in user's profile. Accepts same fields as `RegisterUserDto` but partial.
- Request body: Partial of register fields (firstname, lastname, email, profilePicId, accountStatus)
- Response:
  ```json
  { "message": "User updated successfully", "user": { ...updatedUser } }
  ```

3) DELETE /user/delete
- Guards: AuthGuard
- Description: Permanently delete the logged-in user
- Response: `{ "message": "User deleted successfully" }`

4) POST /user/verify-otp
- Guards: AuthGuard
- Description: Validate a previously-sent OTP (account verification)
- Request body: `{ "otp": "123456" }`
- Response: `{ "message": "OTP verified successfully. Account is now verified." }`

5) GET /user/resend-otp
- Guards: AuthGuard
- Description: Force resend verification OTP (if account unverified)
- Response: `{ "message": "A new OTP has been sent to your email." }`

6) POST /user/forgot-password
- Public
- Description: Request a password-reset link (JWT token) sent to the registered email
- Request body: `{ "email": "jane@example.com" }`
- Response: `{ "message": "A reset password link has been sent to your email!" }`

7) POST /user/reset-password
- Public
- Description: Reset password using token received via email (RESET_LINK flow)
- Request body: `{ "token": "<reset-token>", "password": "newpassword" }`
- Response: `{ "message": "Password Reset was successful!" }`


### Courses (prefix: `/courses`)
Course endpoints demonstrate role-based access with `@Roles(Role.Admin)` for write operations.

1) POST /courses
- Guards: AuthGuard, RolesGuard
- Roles: Admin only
- Request body (CreateCourseDto):
  ```json
  {
    "title": "string",
    "description": "string",
    "instructor": "string",
    "level": "string",
    "price": 0
  }
  ```
- Response: `{ "message": "Course created successfully", "data": <course> }`

2) GET /courses
- Guards: AuthGuard
- Description: Get all courses
- Response: `{ "message": "Courses fetched successfully", "data": [ ... ] }`

3) GET /courses/:id
- Guards: AuthGuard
- Description: Get single course by id
- Response: `{ "message": "Course fetched successfully", "data": { ... } }`

4) PATCH /courses/:id
- Guards: AuthGuard, RolesGuard
- Roles: Admin only
- Request body: Partial CreateCourseDto
- Response: `{ "message": "Course updated successfully", "data": <updated> }`

5) DELETE /courses/:id
- Guards: AuthGuard, RolesGuard
- Roles: Admin only
- Response: `{ "message": "Course deleted successfully" }`


### Email (prefix: `/email`)
1) POST /email/send
- Guards: AuthGuard
- Request body (SendEmailDto):
  ```json
  {
    "recepients": ["a@b.com","c@d.com"],
    "subject": "string",
    "html": "<p>...</p>",
    "text": "optional plain text"
  }
  ```
- Response: No explicit response body. The controller calls the email service.


## DTOs and shapes

- RegisterUserDto
  - firstname: string (required)
  - lastname: string (required)
  - password: string (required)
  - email: string (required, email)
  - profilePicId?: string
  - accountStatus?: 'verified'|'unverified'|'suspended'

- LoginUserDto
  - email: string
  - password: string

- UpdateUserDto
  - Partial of RegisterUserDto

- CreateCourseDto
  - title: string
  - description: string
  - instructor: string
  - level: string
  - price: number

- UpdateCourseDto
  - Partial of CreateCourseDto

- SendEmailDto
  - recepients: string[]
  - subject: string
  - html: string
  - text?: string


## Roles

The app supports two roles (enum `Role`):
- user
- admin

Use the admin role to access course creation, update and delete endpoints.


## Examples

1) Register (multipart):

```bash
curl -X POST http://localhost:3000/auth/register \
  -F "firstname=Jane" \
  -F "lastname=Doe" \
  -F "email=jane@example.com" \
  -F "password=supersecret"
```

Successful response contains `access_token` and sets `refresh_token` cookie.

2) Login and call protected route:

```bash
# login
RESP=$(curl -s -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"supersecret"}')

# extract access token (jq required)
ACCESS=$(echo "$RESP" | jq -r '.access_token')

# call profile
curl -H "Authorization: Bearer $ACCESS" http://localhost:3000/user/profile
```

3) Refresh token (using saved cookie from login above):

```bash
curl -b cookies.txt http://localhost:3000/auth/refresh
```

4) Create course (admin):

```bash
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Nest Mastery","description":"In-depth NestJS","instructor":"Rishav","level":"advanced","price":99}'
```


## Notes & next steps

- Refresh token management: Redis is used to blacklist refresh tokens on logout. Ensure Redis is configured via `VALKEY_URL`.
- OTP service stores hashed OTPs in MongoDB using `otp` schema. OTP lifetimes and types are implemented in `src/otp/otp.service.ts`.
- Email sending and OTP delivery are implemented in `src/otp/otp-email.service.ts` and `src/email/email.service.ts`. Inspect those services for provider details (e.g., nodemailer config) before running in production.
- Profile pictures are uploaded to Cloudinary; supply Cloudinary env vars.

If you want, I can:
- Add example Postman collection or OpenAPI (Swagger) spec generated from controllers
- Add example .env.example with recommended values
- Add README badges and CI instructions

---

Generated by automated repository analysis. If you want the README expanded with an OpenAPI spec or Postman collection, tell me and I will add it.
