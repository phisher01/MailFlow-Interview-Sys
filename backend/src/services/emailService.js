// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initPromise = null; // stores initialization promise
    this.isInitialized = false;
  }

  /**
   * Public init function. Call once at server startup:
   * await emailService.init();
   */
  async init() {
    if (!this.initPromise) {
      this.initPromise = this.initializeTransporter();
      try {
        await this.initPromise;
        this.isInitialized = !!this.transporter;
      } catch (err) {
        // initialization failed - initPromise already rejected; leave isInitialized false
        console.error('EmailService.init error:', err?.message || err);
      }
    } else {
      await this.initPromise;
    }
  }

  /**
   * Internal: create transporter either from env or fallback to Ethereal test account.
   */
  async initializeTransporter() {
    try {
      // If env variables are present, use them
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT, 10) || 587,
          secure: (process.env.EMAIL_SECURE === 'true') || false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        await this.transporter.verify();
        console.log('✅ Email service initialized using provided SMTP config');
        console.log(`📧 Host: ${process.env.EMAIL_HOST}`);
        console.log(`👤 User: ${process.env.EMAIL_USER}`);
        return;
      }

      // Fallback: create an Ethereal test account for development
      console.warn('⚠️ Email env not fully configured — falling back to Ethereal test account for development.');
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      await this.transporter.verify();
      console.log('✅ Email service initialized with Ethereal test account');
      console.log(`📧 Ethereal user: ${testAccount.user}`);
      console.log(`🔐 Ethereal pass: ${testAccount.pass}`);
      console.log('ℹ️ Use nodemailer.getTestMessageUrl(info) to preview messages in the browser.');
    } catch (error) {
      // Keep transporter null on failure
      this.transporter = null;
      console.error('❌ Email service initialization failed:', error?.message || error);
      throw error;
    }
  }

  // ensure transporter is ready before sending
  async ensureReady() {
    if (this.isInitialized && this.transporter) return;
    if (this.initPromise) {
      await this.initPromise;
      this.isInitialized = !!this.transporter;
      if (!this.transporter) {
        throw new Error('Email transporter initialization failed');
      }
      return;
    }
    // if init was never called, attempt to init now
    await this.init();
    if (!this.transporter) throw new Error('Email transporter not initialized after init()');
  }

  /**
   * Send whole campaign
   */
  async sendCampaign(campaignId) {
    await this.ensureReady();

    const campaign = await Campaign.findById(campaignId).populate('createdBy', 'name email');

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'active') {
      throw new Error('Campaign must be active to send');
    }

    // prepare contacts
    let contacts = [];
    if (campaign.recipients && campaign.recipients.length > 0) {
      contacts = campaign.recipients.map(r => ({
        _id: r._id || null,
        email: r.email,
        firstName: r.name?.split(' ')[0] || '',
        lastName: r.name?.split(' ')[1] || ''
      }));
    } else {
      contacts = await Contact.find({
        createdBy: campaign.createdBy._id,
        status: 'subscribed'
      });
    }

    let sentCount = 0;
    let errorCount = 0;
    const errors = [];
    if(contacts.length===0){
      throw new Error ('Ooops! No contacts to send mails!')    }
      

    for (const contact of contacts) {
      try {
        const info = await this.sendSingleEmail(campaign, contact);

        // if using Ethereal, log preview url
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log(`🔗 Preview for ${contact.email}: ${preview}`);

        sentCount++;
        if (contact._id) {
          await Contact.findByIdAndUpdate(contact._id, {
            $inc: { emailsSent: 1 },
            lastEmailSent: new Date()
          }).catch(e => console.warn('Contact update failed:', e.message || e));
        }
      } catch (err) {
        errorCount++;
        errors.push({ email: contact.email, error: err.message || err });
        console.error(`Failed to send to ${contact.email}:`, err.message || err);
      }
    }

    await Campaign.findByIdAndUpdate(campaignId, {
      $set: { status: 'sent', sentAt: new Date() },
      $inc: { 'analytics.sent': sentCount }
    }).catch(e => console.warn('Campaign update failed:', e.message || e));

    return {
      success: true,
      sent: sentCount,
      errors: errorCount,
      details: errors.length ? errors : undefined
    };
  }

  /**
   * Send single personalized email (returns nodemailer result)
   */
  async sendSingleEmail(campaign, contact) {
    if (!this.transporter) throw new Error('Email transporter not initialized');

    const personalizedSubject = this.personalizeContent(campaign.subject, contact);
    const personalizedHtml = this.personalizeContent(campaign.content?.html || '', contact);
    const personalizedText = this.personalizeContent(campaign.content?.text || '', contact) || this.htmlToText(personalizedHtml);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mailflow.com',
      to: contact.email,
      subject: personalizedSubject,
      html: personalizedHtml,
      text: personalizedText
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send a test / preview email. Returns the nodemailer info object.
   */
  async sendTestEmail(to, subject, content) {
    await this.ensureReady();

    if (!to || !subject) {
      throw new Error('Email address and subject are required');
    }

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

    htmlContent = this.personalizeContent(htmlContent, { firstName: 'Test', lastName: 'User', email: to });
    textContent = this.personalizeContent(textContent, { firstName: 'Test', lastName: 'User', email: to });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mailflow.com',
      to,
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      text: textContent
    };

    const result = await this.transporter.sendMail(mailOptions);

    const previewUrl = nodemailer.getTestMessageUrl(result);
    if (previewUrl) {
      console.log('🔗 Ethereal preview URL:', previewUrl);
    }
    console.log('📧 Test email sent (messageId):', result.messageId);

    return result;
  }

  /* Helpers */
  personalizeContent(content, contact = {}) {
    if (!content) return '';

    let personalized = content;
    personalized = personalized.replace(/\{\{firstName\}\}/g, contact.firstName || 'Friend');
    personalized = personalized.replace(/\{\{lastName\}\}/g, contact.lastName || '');
    personalized = personalized.replace(/\{\{fullName\}\}/g, `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Friend');
    personalized = personalized.replace(/\{\{email\}\}/g, contact.email || '');
    return personalized;
  }

  htmlToText(html = '') {
    return String(html)
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}

module.exports = new EmailService();
