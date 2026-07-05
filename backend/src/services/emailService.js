  // backend/src/services/emailService.js
  const { Resend } = require('resend');
  const Campaign = require('../models/Campaign');
  const Contact = require('../models/Contact');

  class EmailService {
    constructor() {
      this.resend = null;
      this.isInitialized = false;
    }

    async init() {
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY missing in env');
        return;
      }
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.isInitialized = true;
      console.log('✅ Email service initialized with Resend');
    }

    async ensureReady() {
      if (!this.isInitialized) {
        throw new Error('Email service not initialized');
      }
    }

    // Replace {{firstName}} / {{lastName}} / {{fullName}} / {{email}} merge tags
    personalize(str, contact) {
      if (!str) return str;
      const firstName = contact.firstName || 'there';
      const lastName = contact.lastName || '';
      const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'there';
      return str
        .replace(/\{\{\s*firstName\s*\}\}/g, firstName)
        .replace(/\{\{\s*lastName\s*\}\}/g, lastName)
        .replace(/\{\{\s*fullName\s*\}\}/g, fullName)
        .replace(/\{\{\s*email\s*\}\}/g, contact.email || '');
    }

    async sendSingleEmail(campaign, contact) {
      await this.ensureReady();
      const result = await this.resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: contact.email,
        subject: this.personalize(campaign.subject, contact),
        html: this.personalize(campaign.content?.html || '', contact),
        text: this.personalize(campaign.content?.text || '', contact),
      });
      // Resend SDK returns { data, error } instead of throwing
      if (result?.error) {
        throw new Error(result.error.message || 'Resend rejected the email');
      }
      return result;
    }

    async sendTestEmail(to, subject, content) {
      await this.ensureReady();
      // content may be a plain HTML string or a { html, text } object
      const html = typeof content === 'string' ? content : content?.html || '';
      const text = typeof content === 'string' ? '' : content?.text || '';
      // fill merge tags with sample values so test emails don't show raw {{tags}}
      const sampleContact = { firstName: 'Test', lastName: 'User', email: to };
      const result = await this.resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject: this.personalize(subject, sampleContact),
        html: this.personalize(html, sampleContact),
        text: this.personalize(text, sampleContact),
      });
      if (result?.error) {
        throw new Error(result.error.message || 'Resend rejected the email');
      }
      return result;
    }

    async sendCampaign(campaignId) {
      await this.ensureReady();

      const campaign = await Campaign.findById(campaignId).populate('createdBy', 'name email');
      if (!campaign) throw new Error('Campaign not found');
      if (campaign.status !== 'active') throw new Error('Campaign must be active to send');

      let contacts = [];
      if (campaign.recipients?.length) {
        contacts = campaign.recipients;
      } else {
        contacts = await Contact.find({ createdBy: campaign.createdBy._id, status: 'subscribed' });
      }

      if (contacts.length === 0) {
        throw new Error('Ooops! No contacts to send mails!');
      }

      let sentCount = 0, errorCount = 0, errors = [];
      for (const contact of contacts) {
        try {
          await this.sendSingleEmail(campaign, contact);
          sentCount++;
        } catch (err) {
          errorCount++;
          errors.push({ email: contact.email, error: err.message });
        }
      }

      await Campaign.findByIdAndUpdate(campaignId, {
        $set: { status: 'sent', sentAt: new Date() },
        $inc: { 'analytics.sent': sentCount },
      });

      return { success: true, sent: sentCount, errors: errorCount, details: errors };
    }
  }

  module.exports = new EmailService();
