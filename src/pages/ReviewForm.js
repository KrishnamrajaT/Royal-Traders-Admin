import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  useTheme,
  Rating,
  styled,
  Alert,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import axios from "axios";
import dayjs  from "dayjs";
const StyledRating = styled(Rating)({
  "& .MuiRating-iconFilled": {
    color: "primary",
  },
  "& .MuiRating-iconHover": {
    color: "primary",
  },
});

const ReviewForm = ({isRefresh,setIsRefresh}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    rating: 0,
    review: "",
    createdAt:dayjs()
  });
  const [location, setLocation] = useState({
    city: '',
    country: ''
  });
  const [locatioError, setLocationError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.rating === 0) newErrors.rating = "Please select a rating";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile is required";
    if (!formData.review.trim()) newErrors.review = "Review is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  let API_RATING_URL = "https://royal-traders-5euy.vercel.app/rating";
  const handleSaveRating = async (values) => {
    try {
      const response = await axios.post(`${API_RATING_URL}`, {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        rating: formData.rating,
        message: formData.review,
        createdAt:dayjs().format('YYYY-MM-DD'),
        address:{city:location.city,country:location.country}
      });
      setIsRefresh(!isRefresh)
      return response.data;

    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response?.data);
      } else if (error.response?.status === 422) {
        throw new Error(
          "Validation failed: " + error.response.data.errors.join(", ")
        );
      } else {
        throw new Error("Saving Review failed. Please try again.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form submitted:", formData);
      handleSaveRating();
      setSubmitted(true);
      setFormData({ name: "", email: "", rating: 0, review: "", mobile:"", });
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Step 1: Get coordinates
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Step 2: Reverse geocode to city/state
        const { latitude, longitude } = position.coords;
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        // Step 3: Update state
        const { address } = response.data;
        setLocation({
          city: address.county,
          country: address.country
        });
        console.log(address,"address")

      } catch (err) {
        setLocationError("Failed to detect location: " + err.message);
        console.error(err);
      }
    };

    fetchLocation();
  }, []);

  return (
    <Card
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 3,
        boxShadow: theme.shadows[10],
        background: "linear-gradient(145deg, #f5f7fa 0%, #e4e8ed 100%)",
      }}
    >
      <CardContent>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            textAlign: "center",
            color: theme.palette.primary.main,
            fontWeight: 700,
            mb: 3,
            fontSize: {
              xs: "30px",
              sm: "2.4rem",
              md: "3rem",
            },
          }}
        >
          Share Your Experience
        </Typography>

        <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />

        {submitted && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Thank you for your review! Your feedback has been submitted.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: theme.palette.primary.light,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Your Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                error={!!errors.mobile}
                helperText={errors.mobile}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: theme.palette.primary.light,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: theme.palette.primary.light,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="subtitle1">Your Rating:</Typography>
                  <StyledRating
                    name="rating"
                    value={formData.rating}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({ ...prev, rating: newValue }));
                    }}
                    precision={0.5}
                    icon={<StarIcon fontSize="inherit" />}
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                  />
                </Box>
                {errors.rating && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    {errors.rating}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Review"
                name="review"
                value={formData.review}
                onChange={handleChange}
                error={!!errors.review}
                helperText={errors.review}
                multiline
                rows={4}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: theme.palette.primary.light,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  background:
                    "linear-gradient(45deg, #2563eb 0%, #1e40af 100%)",
                  color: "white",
                  fontWeight: 600,
                  py: 1.5,
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1e40af 0%, #2563eb 100%)",
                  },
                }}
              >
                Submit Review
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
