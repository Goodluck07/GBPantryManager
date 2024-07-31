import React, { useEffect, useState } from 'react';
import '../styles/globals.css'; // Import your global styles if any
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust the path as necessary

function MyApp({ Component, pageProps }) {
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    // Set auth persistence to local storage
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Set up auth state change listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log('User is signed in:', user);
          } else {
            console.log('User is signed out');
          }
          setIsAuthLoaded(true); // Authentication state is loaded
        });

        // Clean up listener on component unmount
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error('Error setting auth persistence:', error);
      });
  }, []);

  // Show a loading screen or spinner until authentication state is loaded
  if (!isAuthLoaded) {
    return <div>Loading...</div>;
  }

  return <Component {...pageProps} />;
}

export default MyApp;
