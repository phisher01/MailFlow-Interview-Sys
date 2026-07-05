// backend/src/routes/campaigns.js (UPDATED - Fix test email route)
const express = require('express');
const { body } = require('express-validator');
const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getDashboardStats
} = require('../controllers/campaignController');
const { authenticate } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Validation rules
const campaignValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Campaign name must be between 1 and 100 characters'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),
  body('content.html')
    .notEmpty()
    .withMessage('Email content is required'),
  body('type')
    .optional()
    .isIn(['one-time', 'automated', 'newsletter'])
    .withMessage('Invalid campaign type')
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/stats', getDashboardStats);
router.get('/', getCampaigns);
router.get('/:id', getCampaign);
router.post('/', campaignValidation, createCampaign);
router.put('/:id', campaignValidation, updateCampaign);
router.delete('/:id', deleteCampaign);

// Send campaign
router.post('/:id/send', async (req, res) => {
  try {
    const result = await emailService.sendCampaign(req.params.id);
    res.json({
      success: true,
      message: `Campaign sent successfully. ${result.sent} emails sent.`,
      data: result
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending campaign'
    });
  }
});


// NEW: Send preview test email (without campaign ID)
router.post('/preview/test', async (req, res) => {
  try {
    const { email, subject, content } = req.body;
    
    if (!email || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Email, subject, and content are required'
      });
    }

    // Send preview test email
    await emailService.sendTestEmail(email, `[PREVIEW] ${subject}`, content);
    
    res.json({
      success: true,
      message: 'Preview test email sent successfully'
    });

  } catch (error) {
    console.error('Send preview test email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending preview test email'
    });
  }
});
// FIXED: Send test email route
router.post('/:id/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required'
      });
    }

    // Get campaign
    const Campaign = require('../models/Campaign');
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Send test email
    await emailService.sendTestEmail(email, campaign.subject, campaign.content);
    
    res.json({
      success: true,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending test email'
    });
  }
});

module.exports = router;