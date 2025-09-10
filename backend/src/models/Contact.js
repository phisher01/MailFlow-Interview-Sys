const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed', 'bounced', 'complained'],
    default: 'subscribed'
  },
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: Map,
    of: String,
    default: new Map()
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  lastEmailSent: {
    type: Date,
    default: null
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  emailsOpened: {
    type: Number,
    default: 0
  },
  emailsClicked: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// ✅ Compound unique index so each user can only have one contact per email
contactSchema.index({ createdBy: 1, email: 1 }, { unique: true });

// Extra helpful indexes
contactSchema.index({ createdBy: 1, status: 1 });
contactSchema.index({ tags: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

module.exports = mongoose.model('Contact', contactSchema);
