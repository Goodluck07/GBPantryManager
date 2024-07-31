import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const PantryHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;  // Get the current user's ID

  useEffect(() => {
    if (!userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const historyRef = collection(db, 'pantryItemHistory');
    const q = query(historyRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const historyList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(historyList);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  if (loading) return <Typography>Loading history...</Typography>;
  if (error) return <Typography>Error: {error}</Typography>;

  return (
    <Grid container spacing={2}>
      {history.length === 0 ? (
        <Typography>No history available</Typography>
      ) : (
        history.map(entry => (
          <Grid item xs={12} sm={6} md={4} key={entry.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{entry.itemName}</Typography>
                <Typography>Quantity: {entry.itemQuantity}</Typography>
                <Typography>Expiry Date: {entry.expiryDate}</Typography>
                <Typography>Category: {entry.category}</Typography>
                <Typography>Action: {entry.action}</Typography>
                <Typography>Timestamp: {new Date(entry.timestamp.toDate()).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default PantryHistory;
