import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, IconButton, TextField, MenuItem, Select, InputLabel, FormControl, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, doc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import PantryForm from './PantryForm';

const PantryList = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortCriteria, setSortCriteria] = useState("name");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch user data and set userId
  useEffect(() => {
    const fetchUserData = () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
      } else {
        console.log('No user is logged in.');
      }
      setLoading(false); // Stop loading once we have the userId
    };

    fetchUserData();
  }, []);

  // Fetch items when userId changes
  useEffect(() => {
    const fetchItems = async () => {
      if (!userId) return;

      try {
        const itemsRef = collection(db, 'pantryItems');
        const q = query(
          itemsRef,
          where("userId", "==", userId),
          orderBy("expiryDate", "asc"),
          orderBy("__name__", "asc")
        );
        const itemsSnapshot = await getDocs(q);
        const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(itemsList);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    if (!loading) { // Only fetch items if not loading
      fetchItems();
    }
  }, [userId, loading]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsAddingItem(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'pantryItems', id));
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSave = async () => {
    try {
      const itemsRef = collection(db, 'pantryItems');
      const q = query(
        itemsRef,
        where("userId", "==", userId),
        orderBy("expiryDate", "asc"),
        orderBy("__name__", "asc")
      );
      const itemsSnapshot = await getDocs(q);
      const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsList);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
    setSelectedItem(null);
    setIsAddingItem(false);
  };

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
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <TextField
            label="Search Items"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Fruits">Fruits</MenuItem>
              <MenuItem value="Vegetables">Vegetables</MenuItem>
              <MenuItem value="Oil">Oil</MenuItem>
              <MenuItem value="Frozen">Frozen</MenuItem>
              <MenuItem value="Legumes">Legumes</MenuItem>
              <MenuItem value="Nuts">Nuts</MenuItem>
              <MenuItem value="Grains">Grains</MenuItem>
              <MenuItem value="Dairy">Dairy</MenuItem>
              <MenuItem value="Snacks">Snacks</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </Select>
          </FormControl>
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
          <Grid container spacing={2}>
            {sortedItems.length > 0 ? (
              sortedItems.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{item.name}</Typography>
                      <Typography variant="body2">Quantity: {item.quantity}</Typography>
                      <Typography variant="body2">Expiry Date: {item.expiryDate}</Typography>
                      <Typography variant="body2" color={
                        getExpiryStatus(item.expiryDate) === 'expired' ? 'error' :
                        getExpiryStatus(item.expiryDate) === 'nearing' ? 'warning' : 'textPrimary'
                      }>
                        {getExpiryStatus(item.expiryDate) === 'expired' ? 'Expired' :
                         getExpiryStatus(item.expiryDate) === 'nearing' ? 'Near Expiry' : 'Normal'}
                      </Typography>
                      <IconButton onClick={() => handleEdit(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography>No items found</Typography>
            )}
          </Grid>
          {(selectedItem || isAddingItem) && (
            <PantryForm
              editItem={selectedItem}
              isAdding={isAddingItem}
              onSave={handleSave}
              userId={userId}
            />
          )}
          {!isAddingItem && (
            <Button variant="contained" color="primary" onClick={() => setIsAddingItem(true)}>
              Add New Item
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default PantryList;
