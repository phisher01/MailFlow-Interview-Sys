import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  MousePointer,
  Email,
} from '@mui/icons-material';
import SendCampaignDialog from './SendCampaignDialog';

const CampaignCard = ({ campaign, onEdit, onDelete, onSend }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      draft: 'warning',
      active: 'info',
      sent: 'success',
      paused: 'default',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {campaign.name}
            </Typography>
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {campaign.subject}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={campaign.status}
              color={getStatusColor(campaign.status)}
              size="small"
            />
            <Chip
              label={campaign.type}
              variant="outlined"
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Email sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {campaign.analytics.sent || 0} sent
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Visibility sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {campaign.analytics.opens || 0} opens
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MousePointer sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {campaign.analytics.clicks || 0} clicks
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Created: {formatDate(campaign.createdAt)}
          </Typography>
        </CardContent>

        <CardActions>
          {campaign.status === 'draft' && (
            <Button
              size="small"
              startIcon={<Send />}
              onClick={() => setSendDialogOpen(true)}
            >
              Send
            </Button>
          )}
          <Button size="small" startIcon={<Edit />} onClick={() => onEdit(campaign)}>
            Edit
          </Button>
        </CardActions>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { onEdit(campaign); handleMenuClose(); }}>
            <Edit sx={{ mr: 1 }} />
            Edit Campaign
          </MenuItem>
          <MenuItem 
            onClick={() => { onDelete(campaign._id); handleMenuClose(); }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete Campaign
          </MenuItem>
        </Menu>
      </Card>

      <SendCampaignDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        campaign={campaign}
        onSuccess={() => {
          setSendDialogOpen(false);
          if (onSend) onSend();
        }}
      />
    </>
  );
};

export default CampaignCard;