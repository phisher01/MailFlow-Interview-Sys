import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  ButtonGroup,
  Paper,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link,
  Image,
  Code,
} from '@mui/icons-material';

const EmailEditor = ({ value, onChange, placeholder }) => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Visual, 1 = HTML

  const insertText = (before, after = '') => {
    const textarea = document.querySelector('[data-email-editor="true"]');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
      onChange(newText);
    }
  };

  const formatButtons = [
    { icon: FormatBold, action: () => insertText('<strong>', '</strong>'), title: 'Bold' },
    { icon: FormatItalic, action: () => insertText('<em>', '</em>'), title: 'Italic' },
    { icon: FormatUnderlined, action: () => insertText('<u>', '</u>'), title: 'Underline' },
    { icon: FormatListBulleted, action: () => insertText('<ul><li>', '</li></ul>'), title: 'Bullet List' },
    { icon: FormatListNumbered, action: () => insertText('<ol><li>', '</li></ol>'), title: 'Numbered List' },
    { icon: Link, action: () => insertText('<a href="https://example.com">', '</a>'), title: 'Link' },
    { icon: Image, action: () => insertText('<img src="https://example.com/image.jpg" alt="Image" />'), title: 'Image' },
  ];

  const insertTemplate = (template) => {
    onChange(template);
  };

  const emailTemplates = [
    {
      name: 'Welcome Email',
      content: `<h1>Welcome to MailFlow, {{firstName}}!</h1>
<p>Thank you for joining our community. We're excited to have you on board!</p>
<p>Here's what you can expect:</p>
<ul>
  <li>Weekly newsletters with the latest updates</li>
  <li>Exclusive offers and promotions</li>
  <li>Tips and tricks from our experts</li>
</ul>
<p>If you have any questions, feel free to reply to this email.</p>
<p>Best regards,<br/>The MailFlow Team</p>`
    },
    {
      name: 'Newsletter',
      content: `<h1>Weekly Newsletter</h1>
<h2>What's New This Week</h2>
<p>Hello {{firstName}},</p>
<p>Here are the top stories from this week:</p>
<h3>🚀 Product Updates</h3>
<p>We've added several new features to improve your experience...</p>
<h3>📰 Industry News</h3>
<p>Stay up to date with the latest trends in email marketing...</p>
<p>Thanks for reading!<br/>Best regards, The Team</p>`
    },
    {
      name: 'Promotional',
      content: `<h1>🎉 Special Offer Just for You!</h1>
<p>Hi {{firstName}},</p>
<p>We have an exclusive offer that we think you'll love:</p>
<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
  <h2 style="color: #4F46E5;">50% OFF Everything!</h2>
  <p>Use code: <strong>SAVE50</strong></p>
  <p>Valid until the end of this month</p>
</div>
<p>Don't miss out on this amazing deal!</p>
<p><a href="https://example.com/shop" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Shop Now</a></p>`
    }
  ];

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Visual Editor" />
          <Tab label="HTML Code" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          {/* Formatting Toolbar */}
          <Paper sx={{ p: 1, mb: 2 }}>
            <ButtonGroup size="small" sx={{ mb: 2 }}>
              {formatButtons.map((button, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={button.action}
                  title={button.title}
                >
                  <button.icon />
                </IconButton>
              ))}
            </ButtonGroup>

            {/* Quick Templates */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
                Quick Templates:
              </Typography>
              {emailTemplates.map((template, index) => (
                <Button
                  key={index}
                  size="small"
                  variant="outlined"
                  onClick={() => insertTemplate(template.content)}
                >
                  {template.name}
                </Button>
              ))}
            </Box>
          </Paper>

          {/* Editor */}
          <TextField
            fullWidth
            multiline
            rows={15}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Write your email content here...'}
            inputProps={{ 'data-email-editor': 'true' }}
            sx={{ mb: 2 }}
          />

          {/* Merge Tags Help */}
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              💡 Available Merge Tags:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['{firstName}', '{lastName}', '{fullName}', '{email}'].map((tag) => (
                <Button
                  key={tag}
                  size="small"
                  variant="outlined"
                  onClick={() => insertText(`{{${tag.slice(1, -1)}}}`)}
                >
                  {tag}
                </Button>
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <TextField
          fullWidth
          multiline
          rows={20}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter HTML code here..."
          sx={{ fontFamily: 'monospace' }}
        />
      )}
    </Box>
  );
};

export default EmailEditor;