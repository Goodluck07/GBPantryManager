import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const AddItemForm = ({ onAdd, currentItem, onClose, userId }) => {
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
    const q = query(
      itemsRef,
      where('userId', '==', userId),
      where('name', '==', itemName),
      where('expiryDate', '==', expiryDate),
      where('category', '==', category)
    );

    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update the existing item
        const itemDoc = doc(db, 'pantryItems', querySnapshot.docs[0].id);
        const existingItem = querySnapshot.docs[0].data();
        const newQuantity = existingItem.quantity + parseInt(quantity, 10);
        await updateDoc(itemDoc, { quantity: newQuantity });
        setMessage(`Updated item ${itemName} with new quantity ${newQuantity}`);
      } else {
        // Add a new item
        await addDoc(itemsRef, { userId, name: itemName, quantity: parseInt(quantity, 10), expiryDate, category });
        setMessage(`Added new item ${itemName} with quantity ${quantity}`);
      }
      setSeverity('success');
    } catch (error) {
      console.error('Error updating or adding item:', error);
      setMessage('An error occurred while updating or adding the item');
      setSeverity('error');
    }

    // Clear form and close
    setItemName('');
    setQuantity('');
    setExpiryDate('');
    setCategory('');
    onAdd(); // Notify parent of the action
    onClose(); // Close the form
  };

  return (
    <div>
      {/* Form fields are removed as requested */}
      <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage('')}>
        <Alert onClose={() => setMessage('')} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddItemForm;
