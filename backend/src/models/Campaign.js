const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [100, 'Campaign name cannot exceed 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true,
    maxlength: [200, 'Subject line cannot exceed 200 characters']
  },
  content: {
    html: {
      type: String,
      required: [true, 'Email content is required']
    },
    text: {
      type: String,
      default: ''
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'sent', 'paused', 'completed'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['one-time', 'automated', 'newsletter'],
    default: 'one-time'
  },
  recipients: [{
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced'],
      default: 'pending'
    },
    sentAt: Date,
    openedAt: Date,
    clickedAt: Date
  }],
  analytics: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opens: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    bounces: {
      type: Number,
      default: 0
    },
    unsubscribes: {
      type: Number,
      default: 0
    }
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
campaignSchema.index({ createdBy: 1, createdAt: -1 });
campaignSchema.index({ status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
