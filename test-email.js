import { config } from 'dotenv';
import nodemailer from 'nodemailer';

config();

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration');
  console.log('Email Host:', process.env.EMAIL_HOST);
  console.log('Email Port:', process.env.EMAIL_PORT);
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email From:', process.env.EMAIL_FROM);
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'mail.southdelhirealty.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'admin@southdelhirealty.com',
        pass: process.env.EMAIL_PASS || 'Biju@123'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('🔍 Verifying transporter...');
    await transporter.verify();
    console.log('✅ Email configuration is valid!');
    
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'admin@southdelhirealty.com',
      to: process.env.EMAIL_USER || 'admin@southdelhirealty.com',
      subject: 'Test Email - South Delhi Realty Nodemailer Setup',
      text: 'This is a test email to verify that the nodemailer configuration is working correctly.',
      html: `
        <h2>Test Email - South Delhi Realty</h2>
        <p>This is a test email to verify that the nodemailer configuration is working correctly.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>Host: ${process.env.EMAIL_HOST}</li>
          <li>Port: ${process.env.EMAIL_PORT}</li>
          <li>Secure: ${process.env.EMAIL_SECURE}</li>
          <li>User: ${process.env.EMAIL_USER}</li>
        </ul>
        <p>If you received this email, the setup is working correctly!</p>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.response) {
      console.error('Server response:', error.response);
    }
  }
}

testEmailConfiguration(); 