const { validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');

// @desc    Get all campaigns for user
// @route   GET /api/campaigns
// @access  Private
const getCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;

    const query = { createdBy: req.user._id };
    
    if (status) query.status = status;
    if (type) query.type = type;

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email');

    const total = await Campaign.countDocuments(query);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns'
    });
  }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Private
const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('createdBy', 'name email');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign'
    });
  }
};

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private


const createCampaign = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, subject, content, type, scheduledAt } = req.body;

    // Fetch all contacts of this user
    const contacts = await Contact.find({ owner: req.user._id });

    const recipients = contacts.map(contact => ({
      email: contact.email,
      name: contact.name || '',
      status: 'pending'
    }));

    const campaign = new Campaign({
      name,
      subject,
      content,
      type: type || 'one-time',
      scheduledAt: scheduledAt || null,
      recipients,
      createdBy: req.user._id
    });

    await campaign.save();

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully with all your contacts as recipients',
      data: campaign
    });

  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campaign'
    });
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private
const updateCampaign = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, subject, content, type, status } = req.body;

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, subject, content, type, status },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign
    });

  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campaign'
    });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting campaign'
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/campaigns/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get campaign stats
    const totalCampaigns = await Campaign.countDocuments({ createdBy: userId });
    const activeCampaigns = await Campaign.countDocuments({ 
      createdBy: userId, 
      status: 'active' 
    });
    const draftCampaigns = await Campaign.countDocuments({ 
      createdBy: userId, 
      status: 'draft' 
    });

    // Get contact stats
    const totalContacts = await Contact.countDocuments({ createdBy: userId });
    const subscribedContacts = await Contact.countDocuments({ 
      createdBy: userId, 
      status: 'subscribed' 
    });

    // Calculate analytics from campaigns
    const campaigns = await Campaign.find({ createdBy: userId });
    const analytics = campaigns.reduce((acc, campaign) => {
      acc.totalSent += campaign.analytics.sent || 0;
      acc.totalOpens += campaign.analytics.opens || 0;
      acc.totalClicks += campaign.analytics.clicks || 0;
      acc.totalBounces += campaign.analytics.bounces || 0;
      return acc;
    }, {
      totalSent: 0,
      totalOpens: 0,
      totalClicks: 0,
      totalBounces: 0
    });

    const openRate = analytics.totalSent > 0 
      ? ((analytics.totalOpens / analytics.totalSent) * 100).toFixed(1)
      : 0;

    const clickRate = analytics.totalSent > 0 
      ? ((analytics.totalClicks / analytics.totalSent) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          draft: draftCampaigns
        },
        contacts: {
          total: totalContacts,
          subscribed: subscribedContacts
        },
        analytics: {
          ...analytics,
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate)
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};

module.exports = {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getDashboardStats
};