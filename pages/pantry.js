import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import AddItemForm from '../src/AddItemForm';
import PantryList from '../src/PantryList';
import PantryHistory from '../src/PantryHistory';
import styles from '../styles/Pantry.module.css';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

const Pantry = () => {
  const router = useRouter();
  const [refresh, setRefresh] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleAdd = () => {
    setRefresh(!refresh);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setCurrentItem(null);
    setIsFormOpen(false);
  };

  const handleSignOutClick = () => {
    setOpenDialog(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out: ', error);
    } finally {
      setOpenDialog(false);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const toggleHistory = () => {
    console.log('Toggling history:', !showHistory);  // Debug: log toggle action
    setShowHistory(!showHistory);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={handleSignOutClick} className={styles.signOutButton}>
          Sign Out
        </button>
        <h1>Online Pantry Manager</h1>
      </header>
      <main className={styles.mainContent}>
        <AddItemForm onAdd={handleAdd} currentItem={currentItem} onClose={handleCloseForm} />
        <PantryList key={refresh} onEdit={handleEdit} />
        <Button variant="contained" color="secondary" onClick={toggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>
        {showHistory && <PantryHistory />}
      </main>
      <footer className={styles.footer}>
        <p>&copy; GB Pantry Manager</p>
      </footer>

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
