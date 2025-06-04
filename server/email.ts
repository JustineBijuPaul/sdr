import nodemailer from 'nodemailer';
import type { Inquiry, Property } from '../shared/schema';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

// Get email configuration from environment variables
const getEmailConfig = (): EmailConfig => {
  const config = {
    host: process.env.EMAIL_HOST || 'mail.southdelhirealty.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'admin@southdelhirealty.com',
    pass: process.env.EMAIL_PASS || 'Biju@123',
    from: process.env.EMAIL_FROM || 'admin@southdelhirealty.com'
  };

  // Log configuration status (without sensitive data)
  console.log('🔧 Email Configuration:');
  console.log('   HOST:', config.host);
  console.log('   PORT:', config.port);
  console.log('   SECURE:', config.secure);
  console.log('   USER:', config.user ? '✅ Set' : '❌ Missing');
  console.log('   PASS:', config.pass ? '✅ Set' : '❌ Missing');
  console.log('   FROM:', config.from);

  return config;
};

// Create nodemailer transporter
const createTransporter = () => {
  const config = getEmailConfig();
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    // Additional configuration for better compatibility
    tls: {
      rejectUnauthorized: false
    }
  });
};

// HTML template for inquiry notification email
const generateInquiryEmailHTML = (inquiry: Inquiry, property?: Property) => {
  const propertyInfo = property ? `
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #495057; margin: 0 0 10px 0;">Property Details:</h3>
      <p style="margin: 5px 0;"><strong>Title:</strong> ${property.title}</p>
      <p style="margin: 5px 0;"><strong>Type:</strong> ${property.propertyType}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> ${property.status}</p>
      <p style="margin: 5px 0;"><strong>Price:</strong> ₹${property.price.toLocaleString()}</p>
      <p style="margin: 5px 0;"><strong>Area:</strong> ${property.area} ${property.areaUnit}</p>
    </div>
  ` : '<p><em>General inquiry (not related to a specific property)</em></p>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Inquiry - South Delhi Realty</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 5px; text-align: center;">
        <h1 style="margin: 0;">New Inquiry Received</h1>
        <p style="margin: 10px 0 0 0;">South Delhi Realty</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px;">
        <h2 style="color: #007bff; margin-top: 0;">Customer Information</h2>
        
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${inquiry.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${inquiry.phone}">${inquiry.phone}</a></p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(inquiry.createdAt || Date.now()).toLocaleString('en-IN')}</p>
        </div>

        <h3 style="color: #495057;">Message:</h3>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; white-space: pre-wrap;">${inquiry.message}</p>
        </div>

        ${propertyInfo}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
            This email was automatically generated from your South Delhi Realty website inquiry form.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plain text version for inquiry notification
const generateInquiryEmailText = (inquiry: Inquiry, property?: Property) => {
  const propertyInfo = property ? `
Property Details:
- Title: ${property.title}
- Type: ${property.propertyType}
- Status: ${property.status}
- Price: ₹${property.price.toLocaleString()}
- Area: ${property.area} ${property.areaUnit}
` : 'General inquiry (not related to a specific property)';

  return `
New Inquiry Received - South Delhi Realty

Customer Information:
- Name: ${inquiry.name}
- Email: ${inquiry.email}
- Phone: ${inquiry.phone}
- Date: ${new Date(inquiry.createdAt || Date.now()).toLocaleString('en-IN')}

Message:
${inquiry.message}

${propertyInfo}

--
This email was automatically generated from your South Delhi Realty website inquiry form.
  `;
};

// Function to send inquiry notification email
export const sendInquiryNotification = async (inquiry: Inquiry, property?: Property): Promise<void> => {
  try {
    console.log('📧 Starting email notification process...');
    
    const transporter = createTransporter();
    const config = getEmailConfig();
    
    // Verify transporter configuration
    console.log('🔍 Verifying email transporter...');
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');

    const subject = `New Inquiry from ${inquiry.name}${property ? ` - ${property.title}` : ''}`;
    
    const mailOptions = {
      from: config.from,
      to: config.user, // Send to admin email
      subject: subject,
      text: generateInquiryEmailText(inquiry, property),
      html: generateInquiryEmailHTML(inquiry, property),
      replyTo: inquiry.email // Allow admin to reply directly to customer
    };

    console.log('📧 Sending email notification...');
    console.log('   To:', mailOptions.to);
    console.log('   Subject:', mailOptions.subject);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email notification sent successfully');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
  } catch (error) {
    console.error('❌ Failed to send email notification:', error);
    
    // Log specific error details
    if (error instanceof Error) {
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      if ('code' in error) {
        console.error('   Error code:', (error as any).code);
      }
    }
    
    // Don't throw the error to prevent inquiry submission from failing
    // Just log it so admin knows there was an email issue
    console.warn('⚠️  Inquiry was saved but email notification failed');
  }
};

// Function to test email configuration
export const testEmailConfiguration = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🧪 Testing email configuration...');
    
    const transporter = createTransporter();
    await transporter.verify();
    
    return {
      success: true,
      message: 'Email configuration is valid and ready to send emails'
    };
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown email configuration error'
    };
  }
};

// Function to send test email
export const sendTestEmail = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const transporter = createTransporter();
    const config = getEmailConfig();
    
    const testInquiry: Inquiry = {
      id: 0,
      propertyId: null,
      name: 'Test User',
      email: 'test@example.com',
      phone: '+91 9999999999',
      message: 'This is a test email to verify the nodemailer configuration is working correctly.',
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await sendInquiryNotification(testInquiry);
    
    return {
      success: true,
      message: 'Test email sent successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send test email'
    };
  }
}; 