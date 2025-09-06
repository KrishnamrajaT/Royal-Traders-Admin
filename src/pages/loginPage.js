import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  useMediaQuery,
  FormHelperText,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/system";
import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";

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

export default function LoginPage({ onLoginSuccess }) {
  const isSmall = useMediaQuery("(max-width: 768px)");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isRegMode, setIsRegMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [updatePassSuccess, setUpdatePassSuccess] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationText, setEmailVerificationText] = useState("");
  //   const navigate = useNavigate();

  const API_BASE_URL = "https://quantum-server.vercel.app";
  // const API_BASE_URL = "http://localhost:8080";

  // Dynamic validation schema
  const getValidationSchema = () => {
    if (showForgotPassword) {
      return Yup.object({
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
        newPassword: Yup.string()
          .min(8, "Password must be at least 8 characters")
          .matches(/[a-z]/, "Must contain at least one lowercase letter")
          .matches(/[A-Z]/, "Must contain at least one uppercase letter")
          .matches(/[0-9]/, "Must contain at least one number")
          .matches(
            /[^A-Za-z0-9]/,
            "Must contain at least one special character"
          )
          .required("Password is required"),
      });
    }

    return Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      ...(isLoginMode
        ? {
            password: Yup.string().required("Password is required"),
          }
        : {
            name: Yup.string().required("Full name is required"),
            mobile: Yup.string()
              .required("Mobile number is required")
              .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
              .test(
                "is-valid-mobile",
                "Mobile number must start with 6-9",
                (value) => /^[6-9]/.test(value)
              ),
            password: Yup.string()
              .min(8, "Password must be at least 8 characters")
              .matches(/[a-z]/, "Must contain at least one lowercase letter")
              .matches(/[A-Z]/, "Must contain at least one uppercase letter")
              .matches(/[0-9]/, "Must contain at least one number")
              .matches(
                /[^A-Za-z0-9]/,
                "Must contain at least one special character"
              )
              .required("Password is required"),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref("password"), null], "Passwords must match")
              .required("Please confirm your password"),
          }),
    });
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      mobile: "",
      email: "",
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: getValidationSchema(),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      setServerError("");
      setInvalidCredentials(false);

      try {
        if (showForgotPassword) {
          await handlePasswordReset(values);
          resetForm();
          setShowForgotPassword(false);
          setUpdatePassSuccess(true);
        } else if (isLoginMode) {
          await handleLogin(values);
        } else {
          await handleRegistration(values);
          resetForm({
            values: {
              ...formik.initialValues,
              email: values.email,
            },
          });
          setRegistrationSuccess(true);
          setIsLoginMode(true);
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Separate API call functions
  const handlePasswordReset = async (values) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, {
        email: values.email,
        newPassword: values.newPassword,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error("Invalid reset token or expired");
      } else if (error.response?.status === 404) {
        throw new Error("Email not found");
      } else {
        throw new Error("Failed to reset password. Please try again.");
      }
    }
  };

  const handleLogin = async (values) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: values.email,
        password: values.password,
      });
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.vendor));
      //   navigate("/main-page");
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("invalid_credentials");
      } else if (error.response?.status === 403) {
        throw new Error("Account not verified");
      } else {
        throw new Error("Login failed. Please try again.");
      }
    }
  };

  const handleRegistration = async (values) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        userName: values.name,
        mobile: values.mobile,
        email: values.email,
        password: values.password,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response?.data);
      } else if (error.response?.status === 422) {
        throw new Error(
          "Validation failed: " + error.response.data.errors.join(", ")
        );
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    }
  };

  // Centralized error handler
  const handleApiError = (error) => {
    console.error("API Error:", error.message);

    if (error.message === "invalid_credentials") {
      setServerError("Invalid email or password");
    } else if (error.message.includes("Invalid reset token")) {
      setServerError("Email not found");
    } else {
      setServerError(error.message || "An unexpected error occurred");
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (password.length >= 12) score += 1;
    return score;
  };

  const getPasswordStrengthColor = () => {
    if (passwordScore <= 1) return "#ff4444";
    if (passwordScore <= 3) return "#ffbb33";
    return "#00C851";
  };

  const getPasswordStrengthText = () => {
    if (passwordScore <= 1) return "Weak";
    if (passwordScore <= 3) return "Moderate";
    return "Strong";
  };

  const handlePasswordChange = (e) => {
    formik.handleChange(e);
    setPasswordScore(calculatePasswordStrength(e.target.value));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    formik.resetForm();
    setPasswordScore(0);
  };

  const verifyEmail = async (email) => {
    try {
      // Simulate API call - replace with actual verification
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, you would check if email exists in your database
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (isValid) {
        setEmailVerified(true);
        // setEmailVerificationText("Email verified");
      } else {
        setEmailVerified(false);
        setEmailVerificationText("Invalid email format");
      }
    } catch (error) {
      setEmailVerified(false);
      setEmailVerificationText("Verification failed");
    }
  };

  // Handle email input change with debounce
  const handleEmailChange = (e) => {
    const email = e.target.value;
    formik.handleChange(e);

    if (email.length > 3) {
      verifyEmail(email);
    } else {
      setEmailVerified(false);
      setEmailVerificationText("");
    }
  };

  useEffect(() => {
    if (registrationSuccess) {
      setRegistrationSuccess(true);
      const timer = setTimeout(() => {
        setRegistrationSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess]);
  useEffect(() => {
    if (updatePassSuccess) {
      setUpdatePassSuccess(true);
      const timer = setTimeout(() => {
        setUpdatePassSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updatePassSuccess]);

  // Effect for server error alert
  useEffect(() => {
    if (serverError) {
      const timer = setTimeout(() => {
        setServerError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [serverError]);

  // Effect for invalid credentials alert
  useEffect(() => {
    if (invalidCredentials) {
      setInvalidCredentials(true);
      const timer = setTimeout(() => {
        setInvalidCredentials(false);
        setInvalidCredentials(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [invalidCredentials]);

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
          boxShadow: isSmall ? "none" : "-5px 0 20px rgba(0,0,0,0.1)",
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
          onSubmit={formik.handleSubmit}
        >
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight="bold"
            mb={3}
            sx={{ color: "#1e3c72" }}
          >
            {isLoginMode && "Login"}
          </Typography>

          {registrationSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Please login with your credentials.
            </Alert>
          )}
          {updatePassSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password is updated! Please login with your credentials.
            </Alert>
          )}
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          {invalidCredentials && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid credentials. Please check your email and password.
            </Alert>
          )}
          {!showForgotPassword ? (
            <>
              {!isLoginMode && (
                <>
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name"
                    variant="outlined"
                    margin="normal"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    disabled={isSubmitting}
                  />
                  <TextField
                    fullWidth
                    name="mobile"
                    label="Mobile"
                    variant="outlined"
                    margin="normal"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.mobile && Boolean(formik.errors.mobile)
                    }
                    helperText={formik.touched.mobile && formik.errors.mobile}
                    disabled={isSubmitting}
                  />
                </>
              )}

              <TextField
                fullWidth
                name="email"
                label="Email"
                variant="outlined"
                margin="normal"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={isSubmitting}
              />

              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                disabled={isSubmitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                name="email"
                label="Email"
                variant="outlined"
                margin="normal"
                value={formik.values.email}
                onChange={handleEmailChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
              />

              {emailVerificationText && (
                <Typography
                  variant="caption"
                  sx={{
                    color: emailVerified ? "#00C851" : "#ff4444",
                    display: "block",
                    mt: -1,
                    mb: 1,
                  }}
                >
                  {emailVerificationText}
                </Typography>
              )}

              <TextField
                fullWidth
                name="newPassword"
                label="New Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.newPassword &&
                  Boolean(formik.errors.newPassword)
                }
                helperText={
                  formik.touched.newPassword && formik.errors.newPassword
                }
              />

              <GradientButton
                fullWidth
                sx={{ mt: 2 }}
                type="submit" // Make sure this is type="submit"
                disabled={!emailVerified || formik.isSubmitting}
              >
                {formik.isSubmitting ? "Resetting..." : "Reset Password"}
              </GradientButton>

              <Button
                fullWidth
                variant="text"
                sx={{ mt: 2 }}
                onClick={() => {
                  setShowForgotPassword(false);
                  setEmailVerified(false);
                  setEmailVerificationText("");
                }}
              >
                Back to Login
              </Button>
            </>
          )}

          {isLoginMode && !showForgotPassword && (
            <Box sx={{ textAlign: "right", mt: 1 }}>
              <Button
                variant="text"
                sx={{ color: "#1e3c72", fontWeight: "bold" }}
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </Button>
            </Box>
          )}

          {!isLoginMode && (
            <>
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                helperText={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
                disabled={isSubmitting}
              />
              {/* {formik.values.password && (
                <Box sx={{ width: "100%", mt: 1, mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          height: 4,
                          flex: 1,
                          backgroundColor:
                            i <= passwordScore
                              ? getPasswordStrengthColor()
                              : "#e0e0e0",
                          borderRadius: 2,
                          mr: i < 5 ? 1 : 0,
                        }}
                      />
                    ))}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: getPasswordStrengthColor() }}
                  >
                    {passwordScore <= 1
                      ? "Weak"
                      : passwordScore <= 3
                      ? "Moderate"
                      : "Strong"}
                  </Typography>
                </Box>
              )} */}
            </>
          )}

          {!showForgotPassword && (
            <>
              <GradientButton
                fullWidth
                sx={{ mt: 2 }}
                type="submit"
                disabled={isSubmitting || !formik.isValid}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isLoginMode && (
                  "Continue"
                ) }
              </GradientButton>

             
            </>
          )}
        </MotionBox>
      </Grid>
    </Grid>
  );
}
