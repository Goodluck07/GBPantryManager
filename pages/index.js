import React, { useEffect, useState } from "react";
import { auth } from "../firebase"; // Ensure you have this import
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import Auth from "./auth";

const Home = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push("/auth"); // Redirect to the auth page
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div style={styles.container}>
      <button style={styles.signOutButton} onClick={handleSignOut}>
        Sign Out
      </button>
      {/* Your pantry content goes here */}
      <h1>Welcome to your pantry, {user.displayName}!</h1>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    padding: "20px",
  },
  signOutButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "10px 20px",
    backgroundColor: "#f50057",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Home;
