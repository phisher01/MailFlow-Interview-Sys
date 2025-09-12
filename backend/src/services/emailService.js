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

    async sendSingleEmail(campaign, contact) {
      await this.ensureReady();
      return await this.resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: contact.email,
        subject: campaign.subject,
        html: campaign.content?.html || '',
        text: campaign.content?.text || '',
      });
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
