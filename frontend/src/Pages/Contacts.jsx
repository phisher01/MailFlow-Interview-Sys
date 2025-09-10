// frontend/src/pages/Contacts.jsx (Complete Contact List Frontend)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  AppBar,
  Toolbar,
  Grid,
} from '@mui/material';
import {
  Add,
  Search,
  Delete,
  Upload,
  Download,
  People,
  Email,
  PersonAdd,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { contactService } from '../services/contactService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Alert from '../components/shared/Alert';

const ContactsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', firstName: '', lastName: '' });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactService.getContacts();
      if (response.success) {
        setContacts(response.data);
      }
    } catch (err) {
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.email) return;

    try {
      const response = await contactService.createContact(newContact);
      if (response.success) {
        loadContacts();
        setAddDialogOpen(false);
        setNewContact({ email: '', firstName: '', lastName: '' });
      }
    } catch (err) {
      setError('Failed to add contact');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await contactService.deleteContact(contactId);
      loadContacts();
    } catch (err) {
      setError('Failed to delete contact');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.firstName && contact.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.lastName && contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size={60} text="Loading contacts..." />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <People sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Contact Management
          </Typography>
          <Button
            color="inherit"
            startIcon={<Add />}
            onClick={() => setAddDialogOpen(true)}
            sx={{ background: 'rgba(255,255,255,0.1)', '&:hover': { background: 'rgba(255,255,255,0.2)' } }}
          >
            Add Contact
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} sx={{ mb: 3 }} />
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {contacts.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Contacts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #10B981, #34D399)', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {contacts.filter(c => c.status === 'subscribed').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Subscribed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {contacts.filter(c => c.status === 'unsubscribed').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Unsubscribed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300, flexGrow: 1 }}
              />
              <Button variant="outlined" startIcon={<Upload />}>
                Import
              </Button>
              <Button variant="outlined" startIcon={<Download />}>
                Export
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              All Contacts ({filteredContacts.length})
            </Typography>
            
            {filteredContacts.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Added</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact._id} hover>
                        <TableCell>
                          {`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'No Name'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Email sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            {contact.email}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={contact.status}
                            color={contact.status === 'subscribed' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleDeleteContact(contact._id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {searchTerm ? 'No contacts found' : 'No contacts yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first contact'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAddDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                    '&:hover': { background: 'linear-gradient(135deg, #3730A3, #4F46E5)' },
                  }}
                >
                  Add Contact
                </Button>
              </Box>
            )}
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
          '&:hover': { background: 'linear-gradient(135deg, #3730A3, #4F46E5)' },
        }}
        onClick={() => setAddDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Add Contact Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonAdd sx={{ mr: 1 }} />
          Add New Contact
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              required
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={newContact.firstName}
                onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={newContact.lastName}
                onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddContact}
            disabled={!newContact.email}
            startIcon={<PersonAdd />}
          >
            Add Contact
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactsPage;