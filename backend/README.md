# VIG Backend API

A Node.js/Express.js backend API with MongoDB integration for the VIG project.

## Features

- User authentication with JWT
- User management (CRUD operations)
- Password hashing with bcrypt
- Role-based access control
- MongoDB integration with Mongoose
- RESTful API design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/vig
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (admin only)

### Audio Generation

- `POST /api/audio/generate` - Generate audio from text prompt (protected)
- `GET /api/audio/history` - Get user's audio generation history (protected)

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Technologies Used

- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM for MongoDB
- JWT - Authentication
- bcryptjs - Password hashing
- cors - Cross-origin resource sharing
- dotenv - Environment variables 