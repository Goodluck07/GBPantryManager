// src/components/PantryList.js
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, IconButton, TextField, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import PantryForm from './PantryForm';

const PantryList = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortCriteria, setSortCriteria] = useState("name");

  useEffect(() => {
    const fetchItems = async () => {
      const itemsRef = collection(db, 'pantryItems');
      const itemsSnapshot = await getDocs(itemsRef);
      const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsList);
    };

    fetchItems();
  }, []);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsAddingItem(false);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'pantryItems', id));
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    const itemsRef = collection(db, 'pantryItems');
    const itemsSnapshot = await getDocs(itemsRef);
    const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(itemsList);
    setSelectedItem(null);
    setIsAddingItem(false);
  };

  // Filter and sort items
  const filteredItems = items
    .filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === "" || item.category === selectedCategory)
    );

  const sortedItems = filteredItems.sort((a, b) => {
    if (sortCriteria === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortCriteria === "quantity") {
      return a.quantity - b.quantity;
    }
    if (sortCriteria === "expiryDate") {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    }
    return 0;
  });

  // Determine expiry status
  const today = new Date();
  const getExpiryStatus = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'nearing';
    return 'normal';
  };

  return (
    <div>
      {/* Search bar */}
      <TextField
        label="Search Items"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Filter by category */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          label="Category"
        >
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="Grains">Grains</MenuItem>
          <MenuItem value="Vegetables">Vegetables</MenuItem>
          <MenuItem value="Fruits">Fruits</MenuItem>
          <MenuItem value="Frozen">Frozen</MenuItem>
          <MenuItem value="Beverages">Beverages</MenuItem>
          <MenuItem value="Snacks">Snacks</MenuItem>
          <MenuItem value="Dairy">Dairy</MenuItem>
        </Select>
      </FormControl>

      {/* Sort by criteria */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          label="Sort By"
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="quantity">Quantity</MenuItem>
          <MenuItem value="expiryDate">Expiry Date</MenuItem>
        </Select>
      </FormControl>

      {/* PantryForm component */}
      <PantryForm
        editItem={selectedItem}
        isAdding={isAddingItem}
        onSave={handleSave}
      />

      {/* Render list of items */}
      <Grid container spacing={2}>
        {sortedItems.map(item => {
          const expiryStatus = getExpiryStatus(item.expiryDate);
          return (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography>Quantity: {item.quantity}</Typography>
                  <Typography>Expiry Date: {item.expiryDate}</Typography>
                  <Typography>Category: {item.category}</Typography>
                  
                  {/* Display expiry warning */}
                  {expiryStatus === 'expired' && (
                    <Alert severity="error">Expired!</Alert>
                  )}
                  {expiryStatus === 'nearing' && (
                    <Alert severity="warning">Expiring Soon!</Alert>
                  )}

                  <IconButton onClick={() => handleEdit(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default PantryList;
