import React, { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/system";
import EmailIcon from "@mui/icons-material/Email";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from 'react-router-dom';


const MotionBox = motion(Box);

const GradientButton = styled(Button)({
  background: "linear-gradient(90deg, #1e3c72, #2a5298)",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: "30px",
  padding: "10px 24px",
  textTransform: "uppercase",
  "&:hover": {
    background: "linear-gradient(90deg, #2a5298, #1e3c72)",
  },
  "&:disabled": {
    background: "#cccccc",
  },
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
 

  // Static credentials
  const STATIC_EMAIL = "admin@royaltraders.com";
  const STATIC_PASSWORD = "Admin@123";

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError("");
    setSuccess(false);

    setTimeout(() => {
      if (email === STATIC_EMAIL && password === STATIC_PASSWORD) {
        setSuccess(true);
        navigate('/dash-board');
         localStorage.setItem("isAuthenticated", "true"); 
      } else {
        setServerError("Invalid email or password");
      }
      setIsSubmitting(false);
    }, 700);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Grid container sx={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Left Panel */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <MotionBox
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#444" }}
          >
            Welcome to <span style={{ color: "#1e3c72" }}>Royal Traders</span>
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ color: "#444" }}>
            Admin Page
          </Typography>
        </MotionBox>
      </Grid>

      {/* Right Panel with Form */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          boxShadow: "-5px 0 20px rgba(0,0,0,0.1)",
        }}
      >
        <MotionBox
          p={4}
          borderRadius={4}
          maxWidth={400}
          width="100%"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          component="form"
          onSubmit={handleSubmit}
        >
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight="bold"
            mb={3}
            sx={{ color: "#1e3c72" }}
          >
            Login
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Login successful!
            </Alert>
          )}
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <TextField
            fullWidth
            name="email"
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <GradientButton
            fullWidth
            sx={{ mt: 2 }}
            type="submit"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </GradientButton>
        </MotionBox>
      </Grid>
    </Grid>
  );
}