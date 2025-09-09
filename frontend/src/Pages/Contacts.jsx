
// frontend/src/pages/Contacts.jsx
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
  Menu,
  MenuItem,
  Fab,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Upload,
  Download,
  People,
} from '@mui/icons-material';
import { contactService } from '../services/contactService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Alert from '../components/shared/Alert';
import AddContactDialog from '../components/contacts/AddContactDialog';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactService.getContacts({ search: searchTerm });
      if (response.success) {
        setContacts(response.data);
      }
    } catch (err) {
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, contact) => {
    setAnchorEl(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContact(null);
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      await contactService.deleteContact(selectedContact._id);
      loadContacts();
      handleMenuClose();
    } catch (err) {
      setError('Failed to delete contact');
    }
  };

  const getStatusColor = (status) => {
    return status === 'subscribed' ? 'success' : 'default';
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Contact Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your email subscribers and contact lists
        </Typography>
      </Box>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} sx={{ mb: 3 }} />
      )}

      {/* Actions Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
          sx={{ minWidth: 300 }}
        />
        <Button variant="outlined" startIcon={<Upload />}>
          Import Contacts
        </Button>
        <Button variant="outlined" startIcon={<Download />}>
          Export Contacts
        </Button>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Contact
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {contacts.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Contacts
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              {contacts.filter(c => c.status === 'subscribed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subscribed
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              {contacts.filter(c => c.status === 'unsubscribed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unsubscribed
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Contacts Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id} hover>
                    <TableCell>
                      {`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'No Name'}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={contact.status}
                        color={getStatusColor(contact.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {contact.tags && contact.tags.slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                        {contact.tags && contact.tags.length > 3 && (
                          <Chip label={`+${contact.tags.length - 3}`} size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuClick(e, contact)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredContacts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No contacts found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first contact'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Contact
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit Contact
        </MenuItem>
        <MenuItem onClick={handleDeleteContact} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Contact
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Add Contact Dialog */}
      <AddContactDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={loadContacts}
      />
    </Container>
  );
};

export default Contacts;