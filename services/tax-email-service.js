import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.TAX_EMAIL_SERVICE_PORT || 7824;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email provider
  auth: {
    user: process.env.TAX_EMAIL_USER, // Your email for tax service
    pass: process.env.TAX_EMAIL_PASS, // Your app password for tax service
  },
});

// Email templates
const createAdminEmailTemplate = (data) => {
  return {
    from: process.env.TAX_EMAIL_USER,
    to: process.env.TAX_ADMIN_EMAIL || 'taxndtaxes@gmail.com',
    subject: `🚨 New Contact Form Submission - ${data.service}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">📧 New Contact Form Submission</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Tax And Taxes - Customer Inquiry</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="border-left: 4px solid #10b981; padding-left: 20px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin: 0 0 10px 0;">Customer Information</h2>
            <p style="color: #64748b; margin: 0;">Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151; width: 30%;">📧 Name:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">✉️ Email:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">
                <a href="mailto:${data.email}" style="color: #10b981; text-decoration: none;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">📱 Phone:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">
                <a href="tel:${data.phone}" style="color: #10b981; text-decoration: none;">${data.phone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">🏷️ Service:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="background: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                  ${data.service}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #374151; vertical-align: top;">💬 Message:</td>
              <td style="padding: 12px 0; color: #1e293b; line-height: 1.6;">
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 3px solid #10b981;">
                  ${data.message || 'No additional message provided'}
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
          <h3 style="color: #374151; margin: 0 0 15px 0;">Quick Actions</h3>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <a href="mailto:${data.email}?subject=Re: Your inquiry about ${data.service}" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block; margin: 5px;">
              📧 Reply via Email
            </a>
            <a href="tel:${data.phone}" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block; margin: 5px;">
              📞 Call Customer
            </a>
            <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}?text=Hi ${data.name}, thank you for your inquiry about ${data.service}. We're here to help!" 
               style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block; margin: 5px;">
              💬 WhatsApp
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 14px;">
          <p>This email was automatically generated from the Tax And Taxes contact form.</p>
          <p>Please respond within 2 hours to maintain our service commitment.</p>
        </div>
      </div>
    `,
  };
};

const createUserEmailTemplate = (data) => {
  return {
    from: process.env.TAX_EMAIL_USER,
    to: data.email,
    subject: `✅ Thank you for contacting Tax And Taxes - We'll respond within 2 hours!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🎉 Thank You, ${data.name}!</h1>
                <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9; font-weight: 400;">We've received your inquiry</p>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Response Time Card -->
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <div style="background: #dcfce7; color: #166534; padding: 20px; border-radius: 12px; display: inline-block; text-align: center;">
                  <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">⏰ Expected Response Time</h2>
                  <p style="margin: 0 0 5px 0; font-size: 28px; font-weight: 700; color: #059669;">Within 2 Hours</p>
                  <p style="margin: 0; font-size: 14px; opacity: 0.8; font-weight: 500;">On business days (Mon-Sat, 9AM-8PM IST)</p>
                </div>
              </td>
            </tr>
          </table>
          
          <!-- Inquiry Summary -->
          <div style="border-left: 4px solid #10b981; padding-left: 20px; margin-bottom: 25px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 Your Inquiry Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 40%; vertical-align: top;">Service Requested:</td>
                <td style="padding: 10px 0;">
                  <span style="background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block;">
                    ${data.service}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-weight: 600; vertical-align: top;">Submitted On:</td>
                <td style="padding: 10px 0; color: #1e293b; font-weight: 500;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-weight: 600; vertical-align: top;">Reference ID:</td>
                <td style="padding: 10px 0; color: #1e293b; font-family: 'Courier New', monospace; font-weight: 700; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; display: inline-block;">#TT${Date.now().toString().slice(-6)}</td>
              </tr>
            </table>
            
            ${data.message ? `
              <div style="margin-top: 20px;">
                <p style="color: #64748b; font-weight: 600; margin: 0 0 10px 0;">Your Message:</p>
                <div style="background: #f8fafc; padding: 18px; border-radius: 10px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; font-style: italic;">
                  "${data.message}"
                </div>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- What Happens Next -->
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin: 0 0 30px 0; text-align: center; font-size: 20px; font-weight: 600;">🚀 What Happens Next?</h3>
          
          <!-- Step 1 -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;">
            <tr>
              <td width="80" align="center" style="vertical-align: top; padding-right: 20px;">
                <div style="background: #eff6ff; color: #1d4ed8; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto; display: table;">
                  <div style="display: table-cell; text-align: center; vertical-align: middle; font-size: 24px; font-weight: 700;">1</div>
                </div>
              </td>
              <td style="vertical-align: top; padding-left: 0px;">
                <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 18px; font-weight: 600;">Review & Assign</h4>
                <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.5;">Our team reviews your inquiry and assigns the best tax expert for your needs</p>
              </td>
            </tr>
          </table>
          
          <!-- Step 2 -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;">
            <tr>
              <td width="80" align="center" style="vertical-align: top; padding-right: 20px;">
                <div style="background: #f0fdf4; color: #16a34a; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto; display: table;">
                  <div style="display: table-cell; text-align: center; vertical-align: middle; font-size: 24px; font-weight: 700;">2</div>
                </div>
              </td>
              <td style="vertical-align: top; padding-left: 0px;">
                <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 18px; font-weight: 600;">Personal Response</h4>
                <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.5;">You'll receive a personalized response via email or phone within 2 hours</p>
              </td>
            </tr>
          </table>
          
          <!-- Step 3 -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
            <tr>
              <td width="80" align="center" style="vertical-align: top; padding-right: 20px;">
                <div style="background: #fef3c7; color: #d97706; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto; display: table;">
                  <div style="display: table-cell; text-align: center; vertical-align: middle; font-size: 24px; font-weight: 700;">3</div>
                </div>
              </td>
              <td style="vertical-align: top; padding-left: 0px;">
                <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 18px; font-weight: 600;">Schedule Consultation</h4>
                <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.5;">We'll help schedule your tax filing consultation at your convenience</p>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Contact Options -->
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">📞 Need Immediate Assistance?</h3>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding: 10px;">
                <table cellpadding="0" cellspacing="0" border="0" style="display: inline-table;">
                  <tr>
                    <td style="padding: 0 5px;">
                      <a href="tel:+916238495077" style="background: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin: 5px;">
                        📞 Call: +91 62384 95077
                      </a>
                    </td>
                    <td style="padding: 0 5px;">
                      <a href="https://wa.me/916238495077?text=Hi, I just submitted a contact form and need immediate assistance." style="background: #25d366; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin: 5px;">
                        💬 WhatsApp Us
                      </a>
                    </td>
                    <td style="padding: 0 5px;">
                      <a href="mailto:taxndtaxes@gmail.com?subject=Urgent: Follow-up on contact form submission" style="background: #6366f1; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin: 5px;">
                        ✉️ Direct Email
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; font-weight: 500;">
            <strong>Business Hours:</strong> Monday to Saturday, 9:00 AM - 8:00 PM (IST)
          </p>
        </div>
        
        <!-- Company Highlights -->
        <div style="background: linear-gradient(135deg, #1e293b, #334155); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h3 style="margin: 0 0 25px 0; font-size: 20px; font-weight: 600;">🏆 Why Choose Tax And Taxes?</h3>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Achievement 1 -->
              <td width="25%" align="center" style="padding: 15px; vertical-align: top;">
                <div style="font-size: 32px; margin-bottom: 10px;">✅</div>
                <div style="font-weight: 700; font-size: 16px; margin-bottom: 5px;">98.5% Success Rate</div>
                <div style="font-size: 13px; opacity: 0.8;">Accurate filings</div>
              </td>
              
              <!-- Achievement 2 -->
              <td width="25%" align="center" style="padding: 15px; vertical-align: top;">
                <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
                <div style="font-weight: 700; font-size: 16px; margin-bottom: 5px;">24hr Processing</div>
                <div style="font-size: 13px; opacity: 0.8;">Quick turnaround</div>
              </td>
              
              <!-- Achievement 3 -->
              <td width="25%" align="center" style="padding: 15px; vertical-align: top;">
                <div style="font-size: 32px; margin-bottom: 10px;">🔒</div>
                <div style="font-weight: 700; font-size: 16px; margin-bottom: 5px;">100% Secure</div>
                <div style="font-size: 13px; opacity: 0.8;">Bank-grade security</div>
              </td>
              
              <!-- Achievement 4 -->
              <td width="25%" align="center" style="padding: 15px; vertical-align: top;">
                <div style="font-size: 32px; margin-bottom: 10px;">👨‍💼</div>
                <div style="font-weight: 700; font-size: 16px; margin-bottom: 5px;">Expert CAs</div>
                <div style="font-size: 13px; opacity: 0.8;">22+ years of experience</div>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; line-height: 1.6;">
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151;">This is an automated confirmation email from Tax And Taxes.</p>
            <p style="margin: 0; color: #64748b;">Please do not reply to this email. For support, use the contact methods above.</p>
          </div>
          
          <div style="padding: 20px; border-top: 2px solid #e2e8f0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <p style="margin: 0 0 5px 0; font-weight: 700; color: #1e293b; font-size: 16px;">Tax And Taxes</p>
                  <p style="margin: 0; color: #64748b; font-size: 14px; font-style: italic;">Making tax filing simple, accurate, and stress-free!</p>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    `,
  };
};

// API endpoint to handle form submissions
app.post('/api/tax-contact', async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.service) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Send admin notification email
    const adminEmail = createAdminEmailTemplate(formData);
    await transporter.sendMail(adminEmail);
    
    // Send user confirmation email
    const userEmail = createUserEmailTemplate(formData);
    await transporter.sendMail(userEmail);
    
    console.log(`✅ Tax service emails sent successfully for ${formData.name} (${formData.email})`);
    
    res.json({ 
      success: true, 
      message: 'Form submitted successfully! Check your email for confirmation.' 
    });
    
  } catch (error) {
    console.error('❌ Error sending tax service emails:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send emails. Please try again or contact us directly.' 
    });
  }
});

// Health check endpoint
app.get('/api/tax-health', (req, res) => {
  res.json({ 
    status: 'Tax email service is running!', 
    timestamp: new Date().toISOString(),
    service: 'Tax And Taxes Email Service'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tax Email Service running on http://localhost:${PORT}`);
  console.log(`📧 Tax Admin email: ${process.env.TAX_ADMIN_EMAIL || 'taxndtaxes@gmail.com'}`);
  console.log(`📧 Tax Email user: ${process.env.TAX_EMAIL_USER || 'NOT SET'}`);
  console.log(`🔑 Tax Email pass configured: ${process.env.TAX_EMAIL_PASS ? 'YES' : 'NO'}`);
  console.log('✅ Ready to handle Tax And Taxes contact form submissions!');
}).on('error', (err) => {
  console.error('❌ Tax Email Service startup error:', err);
});

export default app; 