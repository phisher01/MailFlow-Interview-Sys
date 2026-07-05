
import React from 'react';
import { Alert as MuiAlert, AlertTitle, Collapse, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

const Alert = ({ 
  type = 'info', 
  message, 
  title,
  onClose, 
  open = true,
  sx = {} 
}) => {
  return (
    <Collapse in={open}>
      <MuiAlert
        severity={type}
        action={
          onClose && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <Close fontSize="inherit" />
            </IconButton>
          )
        }
        sx={{
          mb: 2,
          borderRadius: 2,
          ...sx,
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </MuiAlert>
    </Collapse>
  );
};

export default Alert;