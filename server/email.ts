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
  // Helper function to format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone: string): string => {
    // Remove all non-numeric characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // If it starts with +91, remove it
    if (cleanPhone.startsWith('91') && cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(2);
    }
    
    // If it's 10 digits, add country code
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }
    
    return cleanPhone;
  };

  // WhatsApp link with pre-filled message
  const whatsappPhone = formatPhoneForWhatsApp(inquiry.phone);
  let whatsappMessage = `Hello ${inquiry.name}, this is regarding your inquiry on South Delhi Realty`;
  if (property) {
    whatsappMessage += ` about "${property.title}"`;
  }
  whatsappMessage += '. Thank you for your interest!';
  const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  // Property page link - construct the URL properly handling trailing slashes
  const propertyPageLink = property ? 
    `${(process.env.CLIENT_URL || 'https://southdelhirealty.com').replace(/\/$/, '')}/property/${property.slug || property.id}` : 
    null;

  const propertyInfo = property ? `
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #495057; margin: 0 0 15px 0;">Property Details:</h3>
      <p style="margin: 5px 0;"><strong>Title:</strong> ${property.title}</p>
      <p style="margin: 5px 0;"><strong>Type:</strong> ${property.propertyType}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> ${property.status}</p>
      <p style="margin: 5px 0;"><strong>Price:</strong> ₹${property.price.toLocaleString()}</p>
      <p style="margin: 5px 0;"><strong>Area:</strong> ${property.area} ${property.areaUnit}</p>
      ${propertyPageLink ? `
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #dee2e6;">
        <a href="${propertyPageLink}" 
           style="background-color: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block;">
          🏠 View Property Page
        </a>
      </div>
      ` : ''}
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

        <!-- Quick Action Buttons -->
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h3 style="color: #495057; margin: 0 0 15px 0;">Quick Actions:</h3>
          <div style="margin: 10px 0;">
            <a href="mailto:${inquiry.email}?subject=Re: Your Property Inquiry - South Delhi Realty" 
               style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 5px; display: inline-block; font-size: 14px;">
              📧 Reply via Email
            </a>
          </div>
          <div style="margin: 10px 0;">
            <a href="${whatsappLink}" 
               target="_blank"
               style="background-color: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 5px; display: inline-block; font-size: 14px;">
              💬 Contact via WhatsApp
            </a>
          </div>
          <div style="margin: 10px 0;">
            <a href="tel:${inquiry.phone}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 5px; display: inline-block; font-size: 14px;">
              📞 Call Customer
            </a>
          </div>
        </div>

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
  // Helper function to format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone: string): string => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('91') && cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(2);
    }
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }
    return cleanPhone;
  };

  // Property page link - construct the URL properly handling trailing slashes
  const propertyPageLink = property ? 
    `${(process.env.CLIENT_URL || 'https://southdelhirealty.com').replace(/\/$/, '')}/property/${property.slug || property.id}` : 
    null;

  // WhatsApp link
  const whatsappPhone = formatPhoneForWhatsApp(inquiry.phone);
  let whatsappMessage = `Hello ${inquiry.name}, this is regarding your inquiry on South Delhi Realty`;
  if (property) {
    whatsappMessage += ` about "${property.title}"`;
  }
  whatsappMessage += '. Thank you for your interest!';
  const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  const propertyInfo = property ? `
Property Details:
- Title: ${property.title}
- Type: ${property.propertyType}
- Status: ${property.status}
- Price: ₹${property.price.toLocaleString()}
- Area: ${property.area} ${property.areaUnit}
${propertyPageLink ? `- Property Page: ${propertyPageLink}` : ''}
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

Quick Actions:
- Reply via Email: mailto:${inquiry.email}?subject=Re: Your Property Inquiry - South Delhi Realty
- Contact via WhatsApp: ${whatsappLink}
- Call Customer: tel:${inquiry.phone}

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
    
    // Debug: Log the generated links
    if (property) {
      const propertyPageLink = `${(process.env.CLIENT_URL || 'https://southdelhirealty.com').replace(/\/$/, '')}/property/${property.slug || property.id}`;
      console.log('🔗 Generated property page link:', propertyPageLink);
    }
    
    const formatPhoneForWhatsApp = (phone: string): string => {
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('91') && cleanPhone.length > 10) {
        cleanPhone = cleanPhone.substring(2);
      }
      if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
      }
      return cleanPhone;
    };
    
    const whatsappPhone = formatPhoneForWhatsApp(inquiry.phone);
    let whatsappMessage = `Hello ${inquiry.name}, this is regarding your inquiry on South Delhi Realty`;
    if (property) {
      whatsappMessage += ` about "${property.title}"`;
    }
    whatsappMessage += '. Thank you for your interest!';
    const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    console.log('💬 Generated WhatsApp link:', whatsappLink);
    
    const mailOptions = {
      from: '"South Delhi Realty" <' + config.from + '>', // Professional sender name
      to: config.from,
      subject: subject,
      text: generateInquiryEmailText(inquiry, property),
      html: generateInquiryEmailHTML(inquiry, property)
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

// HTML template for user confirmation email
const generateUserConfirmationEmailHTML = (inquiry: Inquiry, property?: Property) => {
  // Property page link - construct the URL properly handling trailing slashes
  const propertyPageLink = property ? 
    `${(process.env.CLIENT_URL || 'https://southdelhirealty.com').replace(/\/$/, '')}/property/${property.slug || property.id}` : 
    null;

  const propertySection = property ? `
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007bff;">
      <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px;">Property Details</h3>
      <div style="margin-bottom: 15px;">
        <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #495057;">Property:</strong> ${property.title}</p>
        <p style="margin: 8px 0; font-size: 14px; color: #6c757d;"><strong>Type:</strong> ${property.propertyType} | <strong>Status:</strong> ${property.status}</p>
        <p style="margin: 8px 0; font-size: 14px; color: #6c757d;"><strong>Price:</strong> ₹${property.price.toLocaleString()} | <strong>Area:</strong> ${property.area} ${property.areaUnit}</p>
      </div>
      ${propertyPageLink ? `
      <div style="text-align: center; margin-top: 20px;">
        <a href="${propertyPageLink}" 
           style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3); transition: all 0.3s ease;">
          🏠 View Complete Property Details
        </a>
      </div>
      ` : ''}
    </div>
  ` : `
    <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #6c757d; font-style: italic;">Thank you for your general inquiry. We appreciate your interest in South Delhi Realty.</p>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Your Inquiry - South Delhi Realty</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300;">Thank You!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We've received your inquiry</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 30px;">
          
          <!-- Greeting -->
          <div style="margin-bottom: 25px;">
            <h2 style="color: #007bff; margin: 0 0 15px 0; font-size: 22px;">Hello ${inquiry.name}!</h2>
            <p style="margin: 0; font-size: 16px; color: #495057; line-height: 1.7;">
              Thank you for choosing <strong style="color: #007bff;">South Delhi Realty</strong>. We have successfully received your inquiry and our team will reach out to you shortly.
            </p>
          </div>

          ${propertySection}

          <!-- Your Message -->
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">Your Message:</h3>
            <p style="margin: 0; color: #856404; font-style: italic; line-height: 1.6;">"${inquiry.message}"</p>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li style="margin-bottom: 8px;">Our property consultant will review your inquiry</li>
              <li style="margin-bottom: 8px;">We'll contact you within 24 hours via phone or email</li>
              <li style="margin-bottom: 8px;">Schedule a property viewing if you're interested</li>
              <li style="margin-bottom: 8px;">Get personalized assistance throughout your property journey</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">Need immediate assistance?</h3>
            <p style="margin: 0 0 15px 0; color: #6c757d;">Feel free to reach out to us directly:</p>
            <div style="display: inline-block; margin: 10px;">
              <a href="mailto:admin@southdelhirealty.com" 
                 style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 5px;">
                📧 Email Us
              </a>
            </div>
            <div style="display: inline-block; margin: 10px;">
              <a href="https://southdelhirealty.com" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 5px;">
                🌐 Visit Website
              </a>
            </div>
          </div>

          <!-- Thank You Message -->
          <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 8px;">
            <h3 style="color: #007bff; margin: 0 0 10px 0; font-size: 20px;">Thank you for choosing us!</h3>
            <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
              At South Delhi Realty, we're committed to helping you find your dream property. 
              Your trust in us drives our dedication to excellence.
            </p>
          </div>
          
        </div>

        <!-- Footer -->
        <div style="background-color: #343a40; color: white; padding: 25px; text-align: center;">
          <div style="margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #007bff; font-size: 18px;">South Delhi Realty</h4>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Your trusted partner in real estate</p>
          </div>
          
          <div style="border-top: 1px solid #495057; padding-top: 15px; margin-top: 15px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">
              &copy; 2025 South Delhi Realty. All rights reserved.
            </p>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

// Plain text version for user confirmation email
const generateUserConfirmationEmailText = (inquiry: Inquiry, property?: Property) => {
  // Property page link - construct the URL properly handling trailing slashes
  const propertyPageLink = property ? 
    `${(process.env.CLIENT_URL || 'https://southdelhirealty.com').replace(/\/$/, '')}/property/${property.slug || property.id}` : 
    null;

  const propertySection = property ? `
Property Details:
- Property: ${property.title}
- Type: ${property.propertyType} | Status: ${property.status}
- Price: ₹${property.price.toLocaleString()} | Area: ${property.area} ${property.areaUnit}
${propertyPageLink ? `- View Complete Details: ${propertyPageLink}` : ''}
` : 'Thank you for your general inquiry. We appreciate your interest in South Delhi Realty.';

  return `
Thank You for Your Inquiry - South Delhi Realty

Hello ${inquiry.name}!

Thank you for choosing South Delhi Realty. We have successfully received your inquiry and our team will reach out to you shortly.

${propertySection}

Your Message:
"${inquiry.message}"

What happens next?
- Our property consultant will review your inquiry
- We'll contact you within 24 hours via phone or email
- Schedule a property viewing if you're interested
- Get personalized assistance throughout your property journey

Need immediate assistance?
- Email: admin@southdelhirealty.com
- Website: https://southdelhirealty.com

Thank you for choosing us!
At South Delhi Realty, we're committed to helping you find your dream property. Your trust in us drives our dedication to excellence.

---
South Delhi Realty
Your trusted partner in real estate

© 2025 South Delhi Realty. All rights reserved.
  `;
};

// Function to send user confirmation email
export const sendUserConfirmationEmail = async (inquiry: Inquiry, property?: Property): Promise<void> => {
  try {
    console.log('📧 Starting user confirmation email process...');
    console.log('👤 Sending confirmation to:', inquiry.email);
    
    const transporter = createTransporter();
    const config = getEmailConfig();
    
    // Verify transporter configuration
    console.log('🔍 Verifying email transporter for user confirmation...');
    await transporter.verify();
    console.log('✅ Email transporter verified for user confirmation');

    const subject = property 
      ? `Thank you for your inquiry about ${property.title} - South Delhi Realty`
      : 'Thank you for your inquiry - South Delhi Realty';
    
    const mailOptions = {
      from: '"South Delhi Realty" <' + config.from + '>', // Professional sender name
      to: inquiry.email, // Send to the user who made the inquiry
      subject: subject,
      text: generateUserConfirmationEmailText(inquiry, property),
      html: generateUserConfirmationEmailHTML(inquiry, property),
      replyTo: 'admin@southdelhirealty.com' // Users reply to business email
    };

    console.log('📧 Sending user confirmation email...');
    console.log('   To:', mailOptions.to);
    console.log('   Subject:', mailOptions.subject);
    console.log('   From:', mailOptions.from);
    console.log('   Reply-To:', mailOptions.replyTo);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ User confirmation email sent successfully');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
  } catch (error) {
    console.error('❌ Failed to send user confirmation email:', error);
    
    // Log specific error details
    if (error instanceof Error) {
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      if ('code' in error) {
        console.error('   Error code:', (error as any).code);
      }
    }
    
    // Don't throw the error to prevent inquiry submission from failing
    console.warn('⚠️  User confirmation email failed but inquiry was saved');
  }
}; 