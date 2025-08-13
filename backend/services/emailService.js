// Simple email service for development
// In production, you would use a service like SendGrid, Mailgun, or AWS SES

const emailService = {
  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    try {
      // In development, just log the reset link
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      console.log('=== PASSWORD RESET EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Subject: Password Reset Request`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log('===========================');
      
      // In production, you would send an actual email here
      // Example with a real email service:
      /*
      const emailData = {
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      };
      
      // Send email using your preferred service
      await sendEmail(emailData);
      */
      
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      throw new Error('Failed to send email');
    }
  },

  // Send welcome email
  async sendWelcomeEmail(email, name) {
    try {
      console.log('=== WELCOME EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Subject: Welcome to Our Platform`);
      console.log(`Message: Welcome ${name}! Thank you for joining us.`);
      console.log('=====================');
      
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      throw new Error('Failed to send welcome email');
    }
  }
};

module.exports = emailService; 