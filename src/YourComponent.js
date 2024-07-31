// src/components/YourComponent.js
import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { signOut } from 'firebase/auth'; // Adjust as needed
import { auth } from '../firebase'; // Adjust import path as necessary

const YourComponent = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Handle successful sign-out (e.g., redirect to login page)
    } catch (error) {
      // Handle errors (e.g., show error message)
      console.error("Error signing out: ", error);
    }
    setOpenDialog(false);
  };

  return (
    <div>
      {/* Other component code */}

      <Button variant="outlined" color="secondary" onClick={() => setOpenDialog(true)}>
        Sign Out
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to sign out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSignOut} color="secondary">
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default YourComponent;
