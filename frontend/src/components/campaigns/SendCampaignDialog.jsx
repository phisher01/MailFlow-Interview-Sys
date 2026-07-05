import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Send,
  People,
  Email,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';
import { campaignService } from '../../services/campaignService';
import { contactService } from '../../services/contactService';

const SendCampaignDialog = ({ open, onClose, campaign, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendResults, setSendResults] = useState(null);
  const [error, setError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sendToAll, setSendToAll] = useState(true);

  const steps = ['Select Recipients', 'Review & Confirm', 'Send Campaign'];

  useEffect(() => {
    if (open) {
      loadContacts();
    }
  }, [open]);

  const loadContacts = async () => {
    try {
      const response = await contactService.getContacts();
      if (response.success) {
        setContacts(response.data);
        if (sendToAll) {
          setSelectedContacts(response.data.map(c => c._id));
        }
      }
    } catch (err) {
      setError('Failed to load contacts');
    }
  };

 const handleSendTest = async () => {
   if (!testEmail || !campaign) return;
   
   try {
     setLoading(true);
     await campaignService.sendPreviewTestEmail(
       testEmail.trim(),
       campaign.subject,
       campaign.content
      );
      alert('Test email sent successfully!');
    } catch (err) {
      setError('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const handleSendCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignService.sendCampaign(campaign._id);
      
      if (response.success) {
        setSendResults(response.data);
        setActiveStep(2);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      handleSendCampaign();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedContacts([]);
    setSendResults(null);
    setError('');
    setTestEmail('');
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Recipients
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendToAll}
                  onChange={(e) => {
                    setSendToAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedContacts(contacts.map(c => c._id));
                    } else {
                      setSelectedContacts([]);
                    }
                  }}
                />
              }
              label="Send to all subscribers"
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Total subscribers: {contacts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedContacts.length}
              </Typography>
            </Box>

            {!sendToAll && (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {contacts.map((contact) => (
                  <ListItem
                    key={contact._id}
                    button
                    onClick={() => {
                      if (selectedContacts.includes(contact._id)) {
                        setSelectedContacts(prev => prev.filter(id => id !== contact._id));
                      } else {
                        setSelectedContacts(prev => [...prev, contact._id]);
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox checked={selectedContacts.includes(contact._id)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'No Name'}
                      secondary={contact.email}
                    />
                    <Chip
                      label={contact.status}
                      color={contact.status === 'subscribed' ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {/* Test Email Section */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Send Test Email
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Test Email Address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  type="email"
                />
                <Button
                  variant="outlined"
                  onClick={handleSendTest}
                  disabled={loading || !testEmail}
                  startIcon={loading ? <CircularProgress size={16} /> : <Send />}
                >
                  Send Test
                </Button>
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Review & Confirm
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Campaign"
                  secondary={campaign?.name}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <People color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Recipients"
                  secondary={`${selectedContacts.length} subscribers`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Subject"
                  secondary={campaign?.subject}
                />
              </ListItem>
            </List>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Once sent, this campaign cannot be stopped or modified. Make sure you've tested your email content.
              </Typography>
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            {sendResults ? (
              <>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Campaign Sent Successfully!
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    <strong>{sendResults.sent}</strong> emails sent
                  </Typography>
                  {sendResults.errors > 0 && (
                    <Typography variant="body2" color="error">
                      {sendResults.errors} emails failed to send
                    </Typography>
                  )}
                </Box>
                <Alert severity="success">
                  Your campaign is now being delivered to subscribers. You can monitor the results in your dashboard.
                </Alert>
              </>
            ) : (
              <>
                <CircularProgress size={64} sx={{ mb: 2 }} />
                <Typography variant="h6">
                  Sending Campaign...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we send your campaign to all recipients.
                </Typography>
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Send sx={{ mr: 1 }} />
          Send Campaign: {campaign?.name}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {sendResults ? 'Close' : 'Cancel'}
        </Button>
        
        {activeStep > 0 && !sendResults && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        
        {activeStep < 2 && !sendResults && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading || (activeStep === 0 && selectedContacts.length === 0)}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {activeStep === 1 ? 'Send Campaign' : 'Next'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SendCampaignDialog;
