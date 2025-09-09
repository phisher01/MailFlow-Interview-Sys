import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close,
  Send,
  Save,
  Preview,
  Email,
} from '@mui/icons-material';
import { campaignService } from '../../services/campaignService';
import Alert from '../shared/Alert';

const CreateCampaignDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    type: 'one-time',
    content: {
      html: '<h1>Welcome!</h1><p>Thank you for subscribing to our newsletter.</p><p>Best regards,<br/>The MailFlow Team</p>',
      text: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [testEmail, setTestEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await campaignService.createCampaign(formData);
      if (response.success) {
        setSuccess('Campaign created successfully!');
        onSuccess();
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      subject: '',
      type: 'one-time',
      content: { html: '<h1>Welcome!</h1><p>Thank you for subscribing to our newsletter.</p><p>Best regards,<br/>The MailFlow Team</p>', text: '' }
    });
    setError('');
    setSuccess('');
    setTabValue(0);
    setTestEmail('');
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  // FIXED: Send preview test email
  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      setError('Please enter a test email address');
      return;
    }

    if (!formData.subject.trim()) {
      setError('Please enter an email subject first');
      return;
    }

    if (!formData.content.html.trim()) {
      setError('Please enter email content first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Send preview test email
      await campaignService.sendPreviewTestEmail(
        testEmail.trim(),
        formData.subject,
        formData.content
      );
      
      setSuccess(`Test email sent to ${testEmail}! Check your inbox.`);
      setTestEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (tabValue) {
      case 0:
        return (
          <Box sx={{ p: 3, minHeight: '400px' }}>
            <TextField
              fullWidth
              name="name"
              label="Campaign Name"
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 3 }}
              required
              placeholder="e.g., Welcome Series, Product Launch"
            />

            <TextField
              fullWidth
              name="subject"
              label="Email Subject"
              value={formData.subject}
              onChange={handleChange}
              sx={{ mb: 3 }}
              required
              placeholder="e.g., Welcome to MailFlow!"
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Campaign Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Campaign Type"
                onChange={handleChange}
              >
                <MenuItem value="one-time">One-time Campaign</MenuItem>
                <MenuItem value="automated">Automated Series</MenuItem>
                <MenuItem value="newsletter">Newsletter</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ 
              p: 2, 
              bgcolor: 'primary.50', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.200'
            }}>
              <Typography variant="body2" color="primary.main">
                💡 <strong>Tips:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Use personalization: {'{'}firstName{'}'}, {'{'}lastName{'}'}, {'{'}email{'}'}
                <br />
                • Keep subject lines under 50 characters
                <br />
                • Test your campaign before creating it
              </Typography>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3, minHeight: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Email Content
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={12}
              label="HTML Content"
              value={formData.content.html}
              onChange={(e) => handleContentChange('html', e.target.value)}
              sx={{ mb: 3 }}
              placeholder="<h1>Hello {{firstName}}</h1><p>Welcome to our newsletter!</p>"
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Plain Text Content (Optional)"
              value={formData.content.text}
              onChange={(e) => handleContentChange('text', e.target.value)}
              placeholder="Hello {{firstName}}, Welcome to our newsletter!"
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Available merge tags:</strong> {'{'}firstName{'}'}, {'{'}lastName{'}'}, {'{'}email{'}'}, {'{'}fullName{'}'}
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3, minHeight: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Email Preview
            </Typography>

            <Box sx={{ 
              border: '1px solid #ddd', 
              borderRadius: 2, 
              p: 2, 
              bgcolor: 'grey.50',
              mb: 2
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                Subject: {formData.subject || 'Your Email Subject'}
              </Typography>
            </Box>

            <Box 
              sx={{ 
                border: '1px solid #ddd', 
                borderRadius: 2, 
                p: 3, 
                bgcolor: 'white',
                minHeight: '300px',
                mb: 3
              }}
              dangerouslySetInnerHTML={{
                __html: formData.content.html.replace(/\{\{firstName\}\}/g, 'John')
                  .replace(/\{\{lastName\}\}/g, 'Doe')
                  .replace(/\{\{email\}\}/g, 'john.doe@example.com')
                  .replace(/\{\{fullName\}\}/g, 'John Doe')
              }}
            />

            {/* Test Email Section */}
            <Box sx={{ 
              p: 3, 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: '1px solid #ddd'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                📧 Send Test Email
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Your Email Address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  type="email"
                  placeholder="your.email@example.com"
                />
                <Button
                  variant="contained"
                  onClick={sendTestEmail}
                  disabled={loading || !testEmail.trim()}
                  startIcon={loading ? <CircularProgress size={16} /> : <Send />}
                  sx={{ minWidth: 140 }}
                >
                  {loading ? 'Sending...' : 'Send Test'}
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                We'll send a preview to your email so you can see how it looks.
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Email sx={{ mr: 1 }} />
          Create New Campaign
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert type="error" message={error} onClose={() => setError('')} />
          </Box>
        )}

        {success && (
          <Box sx={{ p: 2 }}>
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          </Box>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Campaign Details" />
            <Tab label="Email Content" />
            <Tab label="Preview & Test" />
          </Tabs>
        </Box>

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        
        {tabValue > 0 && (
          <Button
            variant="outlined"
            onClick={() => setTabValue(tabValue - 1)}
            disabled={loading}
          >
            Previous
          </Button>
        )}
        
        {tabValue < 2 ? (
          <Button
            variant="contained"
            onClick={() => setTabValue(tabValue + 1)}
            disabled={loading || !formData.name || !formData.subject}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.subject}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{
              background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3730A3, #4F46E5)',
              },
            }}
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateCampaignDialog