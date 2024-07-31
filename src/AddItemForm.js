// src/components/AddItemForm.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust import path as necessary

const categories = [
  'Grains',
  'Dairy',
  'Snacks',
  'Vegetables',
  'Fruits',
  'Beverages',
  'Frozen',
  'Other'
];

const AddItemForm = ({ onAdd, currentItem, onClose }) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  useEffect(() => {
    if (currentItem) {
      setItemName(currentItem.name);
      setQuantity(currentItem.quantity);
      setExpiryDate(currentItem.expiryDate);
      setCategory(currentItem.category);
    } else {
      // Clear form if no item is selected
      setItemName('');
      setQuantity('');
      setExpiryDate('');
      setCategory('');
    }
  }, [currentItem]);

  const handleSubmit = async () => {
    if (!itemName || !quantity || !expiryDate || !category || quantity < 0) {
      setMessage('Please fill in all fields and ensure quantity is non-negative');
      setSeverity('error');
      return;
    }

    const itemsRef = collection(db, 'pantryItems');
    const q = query(itemsRef, where('name', '==', itemName), where('expiryDate', '==', expiryDate));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const itemDoc = doc(db, 'pantryItems', querySnapshot.docs[0].id);
      const existingItem = querySnapshot.docs[0].data();
      const newQuantity = existingItem.quantity + parseInt(quantity, 10);
      await updateDoc(itemDoc, { quantity: newQuantity });
      setMessage(`Updated item ${itemName} with new quantity ${newQuantity}`);
    } else {
      await addDoc(itemsRef, { name: itemName, quantity: parseInt(quantity, 10), expiryDate, category });
      setMessage(`Added new item ${itemName} with quantity ${quantity}`);
    }

    setItemName('');
    setQuantity('');
    setExpiryDate('');
    setCategory('');
    onAdd();
    onClose();
  };

  return (
    <div>
      <TextField
        label="Item Name"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Quantity"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        fullWidth
        margin="normal"
        error={quantity < 0}
        helperText={quantity < 0 ? 'Quantity cannot be negative' : ''}
      />
      <TextField
        label="Expiry Date"
        type="date"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          label="Category"
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button onClick={handleSubmit} variant="contained" color="primary">
        {currentItem ? 'Update Item' : 'Add Item'}
      </Button>
      {message && (
        <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage('')}>
          <Alert onClose={() => setMessage('')} severity={severity}>
            {message}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default AddItemForm;
