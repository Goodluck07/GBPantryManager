import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import AddItemForm from '../src/AddItemForm';
import PantryList from '../src/PantryList';
import PantryHistory from '../src/PantryHistory'; // Import PantryHistory
import styles from '../styles/Pantry.module.css'; // Ensure this path is correct
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

const Pantry = () => {
  const router = useRouter();
  const [refresh, setRefresh] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // State for the dialog
  const [showHistory, setShowHistory] = useState(false); // State for showing history

  const handleAdd = () => {
    setRefresh(!refresh); // Trigger re-render
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsFormOpen(true); // Open form for editing
  };

  const handleCloseForm = () => {
    setCurrentItem(null);
    setIsFormOpen(false);
  };

  const handleSignOutClick = () => {
    setOpenDialog(true); // Show confirmation dialog
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth'); // Redirect to the authentication page
    } catch (error) {
      console.error('Error signing out: ', error);
    } finally {
      setOpenDialog(false); // Close the dialog after attempting sign-out
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false); // Close dialog without signing out
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory); // Toggle the history view
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={handleSignOutClick} className={styles.signOutButton}>
          Sign Out
        </button>
        <h1>Online Pantry manager</h1>
      </header>
      <main className={styles.mainContent}>
        <AddItemForm onAdd={handleAdd} currentItem={currentItem} onClose={handleCloseForm} />
        <PantryList key={refresh} onEdit={handleEdit} /> {/* Pass `onEdit` to PantryList */}
        <Button variant="contained" color="secondary" onClick={toggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>
        {showHistory && <PantryHistory />} {/* Conditionally render PantryHistory */}
      </main>
      <footer className={styles.footer}>
        <p>&copy; GB Pantry manager</p>
      </footer>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to sign out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
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

export default Pantry;
