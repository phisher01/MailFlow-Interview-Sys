// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Fab,
  Dialog,
} from '@mui/material';

import Mail from '@mui/icons-material/Mail';
import People from '@mui/icons-material/People';
import BarChart from '@mui/icons-material/BarChart';

import ContactsList from './ContactsList';


import Add from '@mui/icons-material/Add';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Send from '@mui/icons-material/Send';
import Visibility from '@mui/icons-material/Visibility';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import Campaign from '@mui/icons-material/Campaign';
import Refresh from '@mui/icons-material/Refresh';
import { useAuth } from '../hooks/useAuth';
import { campaignService } from '../services/campaignService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Alert from '../components/shared/Alert';
import CreateCampaignDialog from '../components/campaigns/CreateCampaignDialog';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [contactsDialogOpen, setContactsDialogOpen] = useState(false);

  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  
  


  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, campaignsResponse] = await Promise.all([
        campaignService.getDashboardStats(),
        campaignService.getCampaigns({ limit: 5 })
      ]);

      if (statsResponse.success) {
        setDashboardData(statsResponse.data);
      }

      if (campaignsResponse.success) {
        setRecentCampaigns(campaignsResponse.data); 
      }

    } catch (err) {
      console.error('Dashboard data loading error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (!dashboardData) return [];

    return [
      {
        title: 'Total Campaigns',
        value: dashboardData.campaigns.total.toString(),
        subtitle: `${dashboardData.campaigns.active} active`,
        icon: <Campaign sx={{ fontSize: 40 }} />,
        color: '#4F46E5',
        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
      },
      {
        title: 'Total Subscribers',
        value: dashboardData.contacts.total.toLocaleString(),
        subtitle: `${dashboardData.contacts.subscribed} subscribed`,
        icon: <People sx={{ fontSize: 40 }} />,
        color: '#06B6D4',
        background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
      },
      {
        title: 'Open Rate',
        value: `${dashboardData.analytics.openRate}%`,
        subtitle: `${dashboardData.analytics.totalOpens} total opens`,
        icon: <Visibility sx={{ fontSize: 40 }} />,
        color: '#F59E0B',
        background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      },
      {
        title: 'Click Rate',
        value: `${dashboardData.analytics.clickRate}%`,
        subtitle: `${dashboardData.analytics.totalClicks} total clicks`,
        icon: <AdsClickIcon sx={{ fontSize: 40 }} />,
        color: '#10B981',
        background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      },
    ];
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: 'success',
      draft: 'warning',
      sent: 'info',
      completed: 'secondary',
      paused: 'default',
    };
    return statusColors[status] || 'default';
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

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  if (loading && !dashboardData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <LoadingSpinner size={60} text="Loading dashboard..." />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Mail sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                MailFlow
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Email Marketing Platform
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <Refresh sx={{ animation: loading ? 'spin 2s linear infinite' : 'none' }} />
            </IconButton>
            
            <IconButton color="inherit">
              <Settings />
            </IconButton>

            <IconButton onClick={handleMenuClick}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: 36,
                  height: 36,
                  fontSize: '1rem',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="subtitle2">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor your email campaigns and subscriber engagement
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          />
        )}

        {/* Stats Grid */}
        {dashboardData && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {getStats().map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    background: stat.background,
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                  className="fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: 2,
                          p: 1,
                          mr: 2,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {stat.title}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {stat.subtitle}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Add />}
                    onClick={() => setCreateCampaignOpen(true)}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #3730A3, #4F46E5)',
                      },
                    }}
                  >
                    Create New Campaign
                  </Button>
                  <Button
  variant="outlined"
  fullWidth
  startIcon={<People />}
  sx={{ py: 1.5 }}
  onClick={() => setContactsDialogOpen(true)} // open dialog
>
  Manage Contacts
</Button>

                  <Button variant="outlined" fullWidth startIcon={<BarChart />} sx={{ py: 1.5 }}>
                    View Analytics
                  </Button>
                  <Button variant="outlined" fullWidth startIcon={<Send />} sx={{ py: 1.5 }}>
                    Email Templates
                  </Button>
                </Box>

                {/* Pro Tip */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                    borderRadius: 2,
                    color: 'white',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    💡 Pro Tip
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Personalized emails have 29% higher open rates. Use merge tags like {'{'}firstName{'}'} to customize your campaigns!
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Campaigns */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Campaigns
                  </Typography>
                  <Button variant="text" size="small">
                    View all campaigns
                  </Button>
                </Box>

                {recentCampaigns.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Campaign</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Sent</TableCell>
                          <TableCell align="right">Opens</TableCell>
                          <TableCell align="right">Clicks</TableCell>
                        </TableRow>
                      </TableHead>
                     <TableBody>
  {recentCampaigns.map((campaign) => (
    <TableRow key={campaign._id} hover>
      <TableCell>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {campaign.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {campaign.type} • {formatDate(campaign.createdAt)}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={campaign.status}
          color={getStatusColor(campaign.status)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">
          {campaign.analytics.sent.toLocaleString()}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Box>
          <Typography variant="body2">
            {campaign.analytics.opens}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {campaign.analytics.sent > 0
              ? ((campaign.analytics.opens / campaign.analytics.sent) * 100).toFixed(1)
              : 0}%
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="right">
        <Box>
          <Typography variant="body2">
            {campaign.analytics.clicks}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {campaign.analytics.sent > 0
              ? ((campaign.analytics.clicks / campaign.analytics.sent) * 100).toFixed(1)
              : 0}%
          </Typography>
        </Box>
      </TableCell>

      {/* New Action Column */}
      <TableCell align="right">
       <Button
  variant="contained"
  size="small"
  onClick={async () => {
    try {
      const res = await campaignService.sendCampaign(campaign._id);
      alert(`✅ ${res.message}`);
      
      // Update local state so status changes immediately
      setRecentCampaigns((prev) =>
        prev.map((c) =>
          c._id === campaign._id
            ? { ...c, status: "sent", sentAt: new Date().toISOString() }
            : c
        )
      );
    } catch (error) {
      alert(
        `❌ Failed to send: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }}
>
  Send
</Button>

      </TableCell>
    </TableRow>
  ))}
</TableBody>

                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Mail sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No campaigns yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Get started by creating your first email campaign
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setCreateCampaignOpen(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #3730A3, #4F46E5)',
                        },
                      }}
                    >
                      Create Campaign
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Activity Section (Future Phase) */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Activity
            </Typography>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <BarChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Activity tracking will be available in Phase 2
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3730A3, #4F46E5)',
          },
        }}
        onClick={() => setCreateCampaignOpen(true)}
      >
        <Add />
      </Fab>

      {/* Create Campaign Dialog */}
      <CreateCampaignDialog
        open={createCampaignOpen}
        onClose={() => setCreateCampaignOpen(false)}
        onSuccess={loadDashboardData}
      />
    {/* Contacts Dialog */}
<Dialog
  open={contactsDialogOpen}
  onClose={() => setContactsDialogOpen(false)}
  fullWidth
  maxWidth="md"
>
  <ContactsList />
</Dialog>
  </Box>

    
  );
};

export default Dashboard;