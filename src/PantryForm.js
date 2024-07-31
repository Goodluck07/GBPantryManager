import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, MenuItem, Alert } from '@mui/material';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const categories = ['Grains', 'Legumes', 'Fruits', 'Vegetables', 'Oil', 'Frozen', 'Nuts', 'Dairy', 'Snacks', 'Others'];

const PantryForm = ({ editItem, isAdding, onSave, userId }) => {
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

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
      userId,
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
      setError('Please fill in all fields correctly.');
      return;
    }
    setError('');

    const itemsRef = collection(db, 'pantryItems');
    const q = query(
      itemsRef,
      where('userId', '==', userId),
      where('name', '==', itemName),
      where('expiryDate', '==', expiryDate),
      where('category', '==', category)
    );

    try {
      if (isAdding) {
        // Check if item already exists
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Add new item if no match is found
          await addDoc(itemsRef, {
            name: itemName,
            quantity: parseInt(itemQuantity, 10),
            expiryDate,
            category,
            userId,
          });
          await logChange('added');
        } else {
          // Update existing item if a match is found
          const itemDoc = doc(db, 'pantryItems', querySnapshot.docs[0].id);
          const existingItem = querySnapshot.docs[0].data();
          const newQuantity = existingItem.quantity + parseInt(itemQuantity, 10);
          await updateDoc(itemDoc, { quantity: newQuantity });
          await logChange('updated');
        }
      } else {
        // Update item
        const itemRef = doc(db, 'pantryItems', editItem.id);
        await updateDoc(itemRef, {
          name: itemName,
          quantity: parseInt(itemQuantity, 10),
          expiryDate,
          category,
        });
        await logChange('updated');
      }
      onSave();
    } catch (error) {
      console.error('Error saving item:', error);
      setError('Error saving item. Please try again.');
    }
  };

  return (
    <div>
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Item Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Quantity"
            variant="outlined"
            type="number"
            fullWidth
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Expiry Date"
            variant="outlined"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            label="Category"
            variant="outlined"
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {isAdding ? 'Add Item' : 'Update Item'}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default PantryForm;
