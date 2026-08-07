# Todo List API

A RESTful API for managing a personal to-do list, built with **Node.js**, **Express**, and **MongoDB (Mongoose)**. Includes user registration/login, JWT-based authentication with refresh tokens, ownership-scoped CRUD operations, input validation, pagination/filtering, and rate limiting.

Built as a solution to the [roadmap.sh Todo List API project](https://roadmap.sh/projects/todo-list-api).

## Features

- User registration & login with hashed passwords (bcrypt)
- JWT authentication (short-lived access token + httpOnly-cookie refresh token)
- Refresh token endpoint to renew access tokens without re-login
- Full CRUD on to-do items, scoped to the authenticated user
- Ownership checks — only the creator of a to-do item can update, view, or delete it
- Request validation on all endpoints (`express-validator`)
- Pagination and text-based filtering on the to-do list
- Rate limiting on all requests

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose
- **Auth:** jsonwebtoken, bcrypt
- **Validation:** express-validator
- **Rate limiting:** express-rate-limit

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB connection (e.g. a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### Installation

```bash
git clone https://github.com/Hicham-Hal/Todo-List-API.git
cd Todo-List-API
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

# MongoDB Atlas credentials
DB_USERNAME=your_db_username
DB_PWD=your_db_password

# JWT secrets — use long, random strings
ACCESS_JWT_SECRET=your_access_token_secret
REFRESH_JWT_SECRET=your_refresh_token_secret
```

> The Mongo connection string is built as `mongodb+srv://<DB_USERNAME>:<DB_PWD>@cluster0.kq56grv.mongodb.net`. If you're pointing at a different cluster, update the URI in `lib/mong.js`.

### Running the server

```bash
npm start
```

The server starts on `http://localhost:3000` (or your configured `PORT`) once it connects to MongoDB.

## API Reference

All request/response bodies are JSON. Protected routes require an `Authorization: Bearer <accessToken>` header.

### Auth

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/register` | Create a new user account | No |
| POST | `/login` | Authenticate and receive an access token | No |
| POST | `/refresh-token` | Exchange a valid refresh token (cookie) for a new access token | No (uses cookie) |

**POST `/register`**
```json
// Request
{
  "name": "John Doe",
  "email": "john@doe.com",
  "password": "password123"
}
```
```json
// Response 201
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
A `refreshToken` is also set as an httpOnly cookie. Returns `409` if the email is already registered, `400` if validation fails.

**POST `/login`**
```json
// Request
{
  "email": "john@doe.com",
  "password": "password123"
}
```
```json
// Response 200
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Returns `401` for an invalid email/password combination (no distinction is made between the two, to avoid leaking which emails are registered).

**POST `/refresh-token`**

Reads the `refreshToken` httpOnly cookie set at login/registration and returns a new access token. Returns `401` if the cookie is missing, `403` if it's invalid or expired.

### Todos

All endpoints below require `Authorization: Bearer <accessToken>` and operate only on to-dos owned by the authenticated user.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/todos` | Create a new to-do item |
| GET | `/todos` | List to-do items (paginated, filterable) |
| GET | `/todos/:id` | Get a single to-do item |
| PUT | `/todos/:id` | Update a to-do item |
| DELETE | `/todos/:id` | Delete a to-do item |

**POST `/todos`**
```json
// Request
{
  "title": "Buy groceries",
  "description": "Buy milk, eggs, and bread"
}
```
```json
// Response 201
{
  "_id": "...",
  "title": "Buy groceries",
  "description": "Buy milk, eggs, and bread",
  "user": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**GET `/todos?page=1&limit=10&term=groceries`**

Query params:
- `page` (optional, default `1`)
- `limit` (optional, default depends on config, max `100`)
- `term` (optional) — case-insensitive filter on the todo title

```json
// Response 200
{
  "data": [
    { "_id": "...", "title": "Buy groceries", "description": "...", "user": "..." }
  ],
  "page": 1,
  "limit": 10,
  "total": 1
}
```

**GET `/todos/:id`**

Returns the to-do item if it belongs to the requester. `404` if it doesn't exist, `403` if it exists but belongs to another user.

**PUT `/todos/:id`**
```json
// Request
{
  "title": "Buy groceries",
  "description": "Buy milk, eggs, bread, and cheese"
}
```
Same `404` / `403` ownership rules as above. Returns the updated item on success.

**DELETE `/todos/:id`**

Same `404` / `403` ownership rules as above. Returns `204` with no body on success.

### Error responses

| Status | Meaning |
|---|---|
| 400 | Validation error (see response body for field-level messages) |
| 401 | Missing/invalid access token, or invalid login credentials |
| 403 | Authenticated, but not the owner of the requested resource |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already registered) |
| 500 | Unexpected server error |

## Project Structure

```
.
├── controllers/
│   ├── auth.controller.js     # register, login, refresh-token logic
│   └── user.controller.js     # todo CRUD logic
├── lib/
│   ├── mong.js                 # MongoDB connection
│   ├── pagination.js           # pagination + filtering middleware
│   ├── rateLimiter.js          # rate limiting config
│   └── verifyToken.js          # JWT auth middleware
├── models/
│   ├── Todo.model.js
│   └── User.model.js
├── routes/
│   ├── auth.route.js
│   └── user.route.js
├── validators/
│   ├── auth.validator.js
│   ├── todo.validator.js
│   └── validate.js
└── index.js
```

## Testing

The project includes an automated test suite using **Vitest**, **Supertest**, and **mongodb-memory-server** (an in-memory MongoDB instance, so tests never touch your real database).

**Run all tests:**
```bash
npm test
```

**Watch mode (re-runs on file changes):**
```bash
npm run test:watch
```

**Run a single file:**
```bash
npm test tests/integration/auth.test.js
```

### Coverage

- `tests/integration/auth.test.js` — register (success, validation, duplicate email), login (success, wrong password, unknown email)
- `tests/integration/todo.test.js` — todo CRUD, ownership enforcement (403 on another user's todo), auth requirement
- `tests/lib/pagination.test.js` — pagination and filtering logic

### Notes

- The rate limiter is disabled when `NODE_ENV=test` (see `app.js`), since the test suite makes many requests in quick succession.

## License

ISC