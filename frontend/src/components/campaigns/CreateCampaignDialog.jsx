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
  Email,
} from '@mui/icons-material';
import { campaignService } from '../../services/campaignService';
import { aiService } from '../../services/aiService'; // <-- import AI service
import Alert from '../shared/Alert';

const CreateCampaignDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    type: 'one-time',
    content: {
      html: '<h1>Welcome!</h1><p>Thank you for subscribing to our newsletter.</p><p>Best regards,<br/>The MailFlow Team</p>',
      text: 'Welcome Thank you for subscribing to our newsletter.The mail flow team'
    }
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
 
  const [tabValue, setTabValue] = useState(0);
  const [testEmail, setTestEmail] = useState('');
  

  // --- AI Handlers ---
  // --- AI Handlers ---
const handleAISubject = async () => {
  if (!formData.name.trim()) {
    setError("Enter a campaign name to generate subject");
    return;
  }
  try {
    setAiLoading(true);
    setError('');
    const subject = await aiService.getSubjectSuggestions(formData.name);
    console.log(subject);
    if (subject) {
      setFormData(prev => ({ ...prev, subject }));
    }
  } catch (err) {
    setError("AI subject suggestion failed");
  } finally {
    setAiLoading(false);
  }
};


  const handleAIContent = async () => {
    if (!formData.name.trim()) {
      setError("Enter a campaign name to generate content");
      return;
    }
    try {
      setAiLoading(true);
      setError('');
      const content = await aiService.getEmailContent(formData.name);
      setFormData(prev => ({
        ...prev,
        content: { ...prev.content, html: content }
      }));
    } catch (err) {
      setError("AI content generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  // --- Standard Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await campaignService.createCampaign(formData);
      if (response.success) {
        setSuccess('Campaign created successfully!');
        onSuccess();
        setTimeout(handleClose, 1500);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value }
    }));
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) { setError('Please enter a test email address'); return; }
    if (!formData.subject.trim()) { setError('Please enter an email subject first'); return; }
    if (!formData.content.html.trim()) { setError('Please enter email content first'); return; }
    try {
      setLoading(true);
      setError('');
      await campaignService.sendPreviewTestEmail(testEmail.trim(), formData.subject, formData.content);
      setSuccess(`Test email sent to ${testEmail}!`);
      setTestEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send test email');
    } finally { setLoading(false); }
  };

  // --- Render Tabs ---
  const renderStepContent = () => {
    switch (tabValue) {
      case 0: // Campaign Details
        return (
          <Box sx={{ p: 3, minHeight: '400px' }}>
            <TextField
              fullWidth
              name="name"
              label="Campaign Name"
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
              placeholder="e.g., Welcome Series"
            />
            <Button variant="outlined" onClick={handleAISubject} disabled={aiLoading} sx={{ mb: 1 }}>
              {aiLoading ? "Generating..." : "✨ Suggest with AI"}
            </Button>

            

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
          </Box>
        );

      case 1: // Email Content
        return (
          <Box sx={{ p: 3, minHeight: '400px' }}>
            <Button variant="outlined" onClick={handleAIContent} disabled={aiLoading} sx={{ mb: 2 }}>
              {aiLoading ? "Generating..." : "✨ Generate Email Content with the help of AI"}
            </Button>

            <TextField
              fullWidth
              multiline
              rows={12}
              label="HTML Content"
              value={formData.content.html}
              onChange={(e) => handleContentChange('html', e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Plain Text Content (Optional)"
              value={formData.content.text}
              onChange={(e) => handleContentChange('text', e.target.value)}
            />
          </Box>
        );

      case 2: // Preview & Test
        return (
          <Box sx={{ p: 3, minHeight: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Email Preview</Typography>
            <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3, bgcolor: 'white', minHeight: '300px', mb: 3 }}
              dangerouslySetInnerHTML={{ __html: formData.content.html.replace(/\{\{firstName\}\}/g, 'John') }} 
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField fullWidth size="small" label="Your Email Address" value={testEmail} onChange={e => setTestEmail(e.target.value)} type="email" placeholder="your.email@example.com" />
              <Button variant="contained" onClick={sendTestEmail} disabled={loading || !testEmail.trim()} startIcon={loading ? <CircularProgress size={16} /> : <Send />}>
                {loading ? 'Sending...' : 'Send Test'}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, minHeight: '600px' } }}>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #4F46E5, #06B6D4)', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}><Email sx={{ mr: 1 }} />Create New Campaign</Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && <Box sx={{ p: 2 }}><Alert type="error" message={error} onClose={() => setError('')} /></Box>}
        {success && <Box sx={{ p: 2 }}><Alert type="success" message={success} onClose={() => setSuccess('')} /></Box>}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newVal) => setTabValue(newVal)}>
            <Tab label="Campaign Details" />
            <Tab label="Email Content" />
            <Tab label="Preview & Test" />
          </Tabs>
        </Box>

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        {tabValue > 0 && <Button variant="outlined" onClick={() => setTabValue(tabValue - 1)} disabled={loading}>Previous</Button>}
        {tabValue < 2 ? <Button variant="contained" onClick={() => setTabValue(tabValue + 1)} disabled={loading || !formData.name || !formData.subject}>Next</Button>
          : <Button variant="contained" onClick={handleSubmit} disabled={loading || !formData.name || !formData.subject} startIcon={loading ? <CircularProgress size={20} /> : <Save />}>Create Campaign</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default CreateCampaignDialog;
