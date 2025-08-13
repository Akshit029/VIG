# Backend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

## Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/vig
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
DEEPAI_API_KEY=your_deepai_api_key_here
```

## Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB (if running locally):
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Windows
   net start MongoDB
   
   # On Linux
   sudo systemctl start mongod
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## Troubleshooting 500 Error

If you're getting a 500 Internal Server Error during registration:

1. **Check MongoDB Connection**: Ensure MongoDB is running and accessible
2. **Check Environment Variables**: Make sure JWT_SECRET is set in .env file
3. **Check Console Logs**: Look for specific error messages in the server console
4. **Test API Endpoint**: Use Postman or curl to test the registration endpoint directly

## Test Registration Endpoint
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Common Issues
- **MongoDB not running**: Start MongoDB service
- **Missing JWT_SECRET**: Add JWT_SECRET to .env file
- **Port already in use**: Change PORT in .env file
- **CORS issues**: Check if frontend URL is correct 