// src/components/PantryHistory.js
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const PantryHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const historyRef = collection(db, 'pantryItemHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const historyList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(historyList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Grid container spacing={2}>
      {history.map(entry => (
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
      ))}
    </Grid>
  );
};

export default PantryHistory;
