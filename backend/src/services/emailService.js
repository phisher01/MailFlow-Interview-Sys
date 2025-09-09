const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Check if email environment variables are set
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️  Email service: Environment variables not fully configured');
        console.warn('   Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in your .env file');
        return;
      }

      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
      console.log(`📧 Email host: ${process.env.EMAIL_HOST}`);
      console.log(`👤 Email user: ${process.env.EMAIL_USER}`);

    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      console.error('   Please check your email configuration in .env file');
      console.error('   For Ethereal email, visit: https://ethereal.email/');
    }
  }

  async sendCampaign(campaignId) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not properly initialized. Please check your email configuration.');
      }

      const campaign = await Campaign.findById(campaignId)
        .populate('createdBy', 'name email');

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'active') {
        throw new Error('Campaign must be active to send');
      }

      // Get contacts for this campaign
      let contacts;
      if (campaign.recipients && campaign.recipients.length > 0) {
        // Use specific recipients
        contacts = campaign.recipients.map(r => ({
          email: r.email,
          firstName: r.name?.split(' ')[0] || '',
          lastName: r.name?.split(' ')[1] || ''
        }));
      } else {
        // Send to all subscribed contacts
        const allContacts = await Contact.find({
          createdBy: campaign.createdBy._id,
          status: 'subscribed'
        });
        contacts = allContacts;
      }

      let sentCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const contact of contacts) {
        try {
          await this.sendSingleEmail(campaign, contact);
          sentCount++;

          // Update contact stats
          await Contact.findByIdAndUpdate(contact._id, {
            $inc: { emailsSent: 1 },
            lastEmailSent: new Date()
          });

        } catch (error) {
          errorCount++;
          errors.push({
            email: contact.email,
            error: error.message
          });
        }
      }

      // Update campaign analytics
      await Campaign.findByIdAndUpdate(campaignId, {
        $set: {
          status: 'sent',
          sentAt: new Date()
        },
        $inc: {
          'analytics.sent': sentCount
        }
      });

      return {
        success: true,
        sent: sentCount,
        errors: errorCount,
        details: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Send campaign error:', error);
      throw error;
    }
  }

  async sendSingleEmail(campaign, contact) {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    // Personalize email content
    const personalizedSubject = this.personalizeContent(campaign.subject, contact);
    const personalizedHtmlContent = this.personalizeContent(campaign.content.html, contact);
    const personalizedTextContent = this.personalizeContent(campaign.content.text || '', contact);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mailflow.com',
      to: contact.email,
      subject: personalizedSubject,
      html: personalizedHtmlContent,
      text: personalizedTextContent || this.htmlToText(personalizedHtmlContent)
    };

    const result = await this.transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${contact.email}:`, result.messageId);
    return result;
  }

  personalizeContent(content, contact) {
    if (!content) return '';

    let personalized = content;

    // Replace merge tags
    personalized = personalized.replace(/\{\{firstName\}\}/g, contact.firstName || 'Friend');
    personalized = personalized.replace(/\{\{lastName\}\}/g, contact.lastName || '');
    personalized = personalized.replace(/\{\{fullName\}\}/g, 
      `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Friend'
    );
    personalized = personalized.replace(/\{\{email\}\}/g, contact.email);

    return personalized;
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  async sendTestEmail(to, subject, content) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not properly initialized. Please check your email configuration in the .env file.');
      }

      if (!to || !subject) {
        throw new Error('Email address and subject are required');
      }

      // Handle content being an object or string
      let htmlContent = '';
      let textContent = '';

      if (typeof content === 'object' && content.html) {
        htmlContent = content.html;
        textContent = content.text || this.htmlToText(content.html);
      } else if (typeof content === 'string') {
        htmlContent = content;
        textContent = this.htmlToText(content);
      } else {
        throw new Error('Invalid email content format');
      }

      // Personalize content for test
      htmlContent = this.personalizeContent(htmlContent, {
        firstName: 'John',
        lastName: 'Doe',
        email: to
      });

      textContent = this.personalizeContent(textContent, {
        firstName: 'John',
        lastName: 'Doe', 
        email: to
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@mailflow.com',
        to: to,
        subject: `[TEST] ${subject}`,
        html: htmlContent,
        text: textContent
      };

      console.log(`📧 Sending test email to: ${to}`);
      console.log(`📧 Subject: ${mailOptions.subject}`);
      console.log(`📧 From: ${mailOptions.from}`);

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Test email sent successfully!`);
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
      
      return result;

    } catch (error) {
      console.error('❌ Send test email error:', error.message);
      throw new Error(`Failed to send test email: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
