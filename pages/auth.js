import React, { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import styles from "../styles/Auth.module.css";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField } from '@mui/material';

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/pantry");
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        setError("Wrong email or password");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/pantry");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Sorry, this email has already been registered");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent. Check your inbox.");
      setOpenForgotPassword(false);
    } catch (error) {
      setError("Failed to send password reset email. Please try again.");
    }
  };

  const handleForgotPasswordClick = () => {
    setOpenForgotPassword(true);
  };

  const handleCloseForgotPasswordDialog = () => {
    setOpenForgotPassword(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>{isSignIn ? "Sign In" : "Sign Up"}</h1>
        <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className={styles.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className={styles.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            {isSignIn ? "Sign In" : "Sign Up"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
        {isSignIn && (
          <button onClick={handleForgotPasswordClick} className={styles.forgotPasswordButton}>
            Forgot Password?
          </button>
        )}
        <button onClick={() => setIsSignIn(!isSignIn)} className={styles.toggleButton}>
          {isSignIn ? "Need an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>

      <Dialog open={openForgotPassword} onClose={handleCloseForgotPasswordDialog}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <Typography>Please enter your email address. We will send you a link to reset your password.</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForgotPasswordDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleForgotPassword} color="secondary">
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Auth;
