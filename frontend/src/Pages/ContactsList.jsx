// components/ContactsList.jsx
import React, { useEffect, useState } from 'react';
import { contactService } from '../services/contactService';
import { Box, Typography, Button, TextField, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await contactService.getContacts();
      setContacts(res.data);
    } catch (err) {
      console.error(err);
      setError('Error fetching contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setError('');
    if (!newContact.email) {
      setError('Email is required');
      return;
    }

    try {
      await contactService.createContact(newContact);
      setNewContact({ email: '', firstName: '', lastName: '' });
      setShowAddForm(false);
      fetchContacts(); // Refresh list
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error adding contact');
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">My Contacts</Typography>
        <Button variant="contained" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Cancel' : 'Add Contact'}
        </Button>
      </Box>

      {showAddForm && (
        <Box component="form" onSubmit={handleAddContact} mb={2} display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Email"
            type="email"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            required
          />
          <TextField
            label="First Name"
            value={newContact.firstName}
            onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
          />
          <TextField
            label="Last Name"
            value={newContact.lastName}
            onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
          />
          <Button type="submit" variant="contained" color="primary">
            Add
          </Button>
          {error && <Typography color="error">{error}</Typography>}
        </Box>
      )}

      {loading ? (
        <Typography>Loading contacts...</Typography>
      ) : contacts.length === 0 ? (
        <Typography>No contacts found.</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subscribed At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>{`${c.firstName || ''} ${c.lastName || ''}`.trim() || '-'}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell>{new Date(c.subscribedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default ContactsList;
