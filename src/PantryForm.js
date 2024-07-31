// src/components/PantryForm.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, MenuItem } from '@mui/material';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const categories = ['Grains', 'Dairy', 'Snacks', 'Others']; // Example categories

const PantryForm = ({ editItem, isAdding, onSave }) => {
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (editItem) {
      setItemName(editItem.name);
      setItemQuantity(editItem.quantity);
      setExpiryDate(editItem.expiryDate);
      setCategory(editItem.category);
    } else if (isAdding) {
      setItemName('');
      setItemQuantity('');
      setExpiryDate('');
      setCategory('');
    }
  }, [editItem, isAdding]);

  const logChange = async (action) => {
    const historyRef = collection(db, 'pantryItemHistory');
    await addDoc(historyRef, {
      itemName,
      itemQuantity: parseInt(itemQuantity, 10),
      expiryDate,
      category,
      action,
      timestamp: new Date(),
    });
  };

  const handleSave = async () => {
    if (!itemName || !itemQuantity || !expiryDate || itemQuantity < 0) {
      console.error('Please fill in all fields and ensure quantity is non-negative');
      return;
    }

    const itemsRef = collection(db, 'pantryItems');
    if (editItem) {
      const itemRef = doc(db, 'pantryItems', editItem.id);
      await updateDoc(itemRef, {
        name: itemName,
        quantity: parseInt(itemQuantity, 10),
        expiryDate,
        category
      });

      // Log the change to the history collection
      await logChange('update');
    } else if (isAdding) {
      const q = query(itemsRef, where('name', '==', itemName), where('expiryDate', '==', expiryDate));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(itemsRef, {
          name: itemName,
          quantity: parseInt(itemQuantity, 10),
          expiryDate,
          category
        });
        console.log(`Added new item ${itemName} with quantity ${itemQuantity}`);

        // Log the addition to the history collection
        await logChange('add');
      } else {
        console.log('Item already exists with the same name and expiry date.');
      }
    }

    setItemName('');
    setItemQuantity('');
    setExpiryDate('');
    setCategory('');
    onSave();
  };

  return (
    (editItem || isAdding) ? (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Quantity"
            type="number"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
            fullWidth
            error={itemQuantity < 0}
            helperText={itemQuantity < 0 ? 'Quantity cannot be negative' : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Expiry Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Category"
            select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editItem ? 'Update Item' : 'Add Item'}
          </Button>
        </Grid>
      </Grid>
    ) : null
  );
};

export default PantryForm;
