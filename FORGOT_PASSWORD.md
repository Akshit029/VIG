# Forgot Password Functionality

This document describes the forgot password functionality that has been implemented in the application.

## Overview

The forgot password feature allows users to reset their password if they forget it. The process involves:

1. User requests a password reset by entering their email
2. System generates a secure reset token and sends it via email
3. User clicks the reset link in their email
4. User enters a new password
5. System validates the token and updates the password

## Backend Implementation

### Database Changes

The `User` model has been updated with two new fields:

```javascript
resetPasswordToken: {
  type: String,
  default: null
},
resetPasswordExpires: {
  type: Date,
  default: null
}
```

### API Endpoints

#### POST /api/auth/forgot-password
- **Purpose**: Request a password reset
- **Body**: `{ email: string }`
- **Response**: Success message (doesn't reveal if email exists)

#### POST /api/auth/reset-password
- **Purpose**: Reset password using token
- **Body**: `{ token: string, password: string }`
- **Response**: Success message

### Email Service

A simple email service has been created for development purposes:

- **Location**: `backend/services/emailService.js`
- **Functionality**: Logs email content to console instead of sending actual emails
- **Production**: Should be replaced with a real email service (SendGrid, Mailgun, AWS SES)

## Frontend Implementation

### New Pages

#### ForgotPassword (`/forgot-password`)
- Modern UI matching the existing design
- Email input form
- Success state with confirmation message
- Navigation back to login

#### ResetPassword (`/reset-password`)
- Accepts reset token from URL parameter
- Password and confirm password fields
- Validation for password matching and length
- Success state with navigation to login
- Error handling for invalid/expired tokens

### Updated Components

#### Login Page
- Added "Forgot your password?" link
- Updated to use React Router navigation

#### App.jsx
- Added routes for forgot password and reset password pages

#### Auth Service
- Added `forgotPassword(email)` method
- Added `resetPassword(token, password)` method

## Security Features

1. **Token Expiration**: Reset tokens expire after 1 hour
2. **Secure Tokens**: 32-byte random hex tokens
3. **No Email Enumeration**: Same response for existing/non-existing emails
4. **Token Invalidation**: Tokens are cleared after use
5. **Password Validation**: Minimum 6 characters required

## Usage Flow

1. User clicks "Forgot your password?" on login page
2. User enters their email address
3. System sends reset email (logged to console in development)
4. User clicks reset link in email
5. User enters new password and confirmation
6. System validates and updates password
7. User is redirected to login page

## Development Notes

### Email Service
In development, the email service logs to console instead of sending actual emails. The reset link will be displayed in the console and can be copied to test the functionality.

### Environment Variables
The following environment variables can be configured:

- `FRONTEND_URL`: Frontend URL for reset links (defaults to `http://localhost:3000`)
- `NODE_ENV`: Environment mode (development/production)

### Testing
To test the forgot password flow:

1. Register a new user
2. Go to login page and click "Forgot your password?"
3. Enter the user's email
4. Check the console for the reset link
5. Copy the link and navigate to it
6. Enter a new password
7. Verify you can login with the new password

## Production Considerations

1. **Email Service**: Replace the mock email service with a real email provider
2. **Rate Limiting**: Implement rate limiting for forgot password requests
3. **Email Templates**: Create professional email templates
4. **Monitoring**: Add logging and monitoring for email delivery
5. **Security Headers**: Ensure proper security headers are set
6. **HTTPS**: Ensure all reset links use HTTPS in production 