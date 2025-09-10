const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');

// @desc    Get all contacts for user
// @route   GET /api/contacts
// @access  Private
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts'
    });
  }
};

    
// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
const createContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, firstName, lastName, tags, customFields } = req.body;

    // Check if contact already exists
    const existingContact = await Contact.findOne({ 
      email: email.toLowerCase(),
      createdBy: req.user._id 
    });

    if (existingContact) {
      console.log('Exising constact found');
            return res.status(400).json({
        success: false,
        message: 'Contact with this email already exists'
      });
    }

    const contact = new Contact({
      email: email.toLowerCase(),
      firstName,
      lastName,
      tags: tags || [],
      customFields: customFields || {},
      createdBy: req.user._id
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: contact
    });

  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating contact'
    });
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, status, tags, customFields } = req.body;

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { firstName, lastName, status, tags, customFields },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact'
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact'
    });
  }
};

// @desc    Bulk import contacts
// @route   POST /api/contacts/import
// @access  Private
const importContacts = async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({
        success: false,
        message: 'Contacts array is required'
      });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    for (const contactData of contacts) {
      try {
        // Check if contact exists
        const existingContact = await Contact.findOne({
          email: contactData.email?.toLowerCase(),
          createdBy: req.user._id
        });

        if (existingContact) {
          results.skipped++;
          continue;
        }

        // Create new contact
        const contact = new Contact({
          ...contactData,
          email: contactData.email?.toLowerCase(),
          createdBy: req.user._id
        });

        await contact.save();
        results.imported++;

      } catch (error) {
        results.errors.push({
          email: contactData.email,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${results.imported} contacts imported, ${results.skipped} skipped`,
      data: results
    });

  } catch (error) {
    console.error('Import contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing contacts'
    });
  }
};

module.exports = {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
  importContacts
};
