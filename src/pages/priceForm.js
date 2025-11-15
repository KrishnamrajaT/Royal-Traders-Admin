import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  InputAdornment,
  useTheme,
  useMediaQuery,
  FormHelperText,
  Alert,
} from "@mui/material";

export default function OfferForm({ onSubmit }) {
  const [price12, setPrice12] = useState("");
  const [offerPrice12, setOfferPrice12] = useState("");
  const [offerPercent12, setOfferPercent12] = useState("");
  const [price3, setPrice3] = useState("");

  const [errors, setErrors] = useState([]); // validation / server errors
  const [success, setSuccess] = useState(false); // submission confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // calculate offer price from percent and base price
  useEffect(() => {
    const p = parseFloat(price12);
    const pct = parseFloat(offerPercent12);

    if (isNaN(p) || isNaN(pct)) {
      setOfferPrice12("");
      return;
    }

    const clamped = Math.max(0, Math.min(100, pct));
    const discounted = p * (1 - clamped / 100);
    setOfferPrice12(Number.isFinite(discounted) ? discounted.toFixed(2) : "");
  }, [price12, offerPercent12]);

  const validate = () => {
    const errs = [];
    const p12 = parseFloat(price12);
    const pct12 = parseFloat(offerPercent12);
    const p3 = parseFloat(price3);

    if (price12 === "" || isNaN(p12) || p12 <= 0) {
      errs.push("12 months price is required and must be greater than 0.");
    }

    if (offerPercent12 === "" || isNaN(pct12) || pct12 < 0 || pct12 > 100) {
      errs.push(
        "12 months offer percentage is required and must be between 0 and 100."
      );
    }

    if (offerPrice12 === "" || isNaN(parseFloat(offerPrice12))) {
      errs.push("12 months offer price could not be calculated. Check inputs.");
    }

    if (price3 !== "" && (isNaN(p3) || p3 <= 0)) {
      errs.push("3 months price must be a number greater than 0 when provided.");
    }

    return errs;
  };

  // POST to API and handle response
  const postPriceLabel = async (payload) => {
    const url = "https://royal-traders-5euy.vercel.app/pricelabel";
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        // try to parse error message
        let errText = resp.statusText;
        try {
          const json = await resp.json();
          errText = json.message || JSON.stringify(json);
        } catch {
          /* ignore parse error */
        }
        throw new Error(errText || `Request failed with status ${resp.status}`);
      }

      return await resp.json();
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setErrors([]);
    const errs = validate();
    if (errs.length) {
      setErrors(errs);
      return;
    }

    const payload = {
      price12: parseFloat(price12),
      offerPrice12: parseFloat(offerPrice12),
      offerPercent12: parseFloat(offerPercent12),
      price3: price3 === "" ? null : parseFloat(price3),
    };

    setIsSubmitting(true);
    try {
      const result = await postPriceLabel(payload);
      // show success and optionally call parent onSubmit
      setSuccess(true);
      if (onSubmit) onSubmit(result);
      // navigate back to dashboard after short delay
      setTimeout(() => {
        navigate("/dash-board", { replace: true });
      }, 800);
    } catch (err) {
      setErrors([err.message || "Failed to save pricing."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPrice12("");
    setOfferPercent12("");
    setOfferPrice12("");
    setPrice3("");
    setErrors([]);
    setSuccess(false);
  };

  // shared sizing so every input has exact same width
  const fieldWrapperSx = { width: "100%", maxWidth: { xs: "100%", md: 720 } };
  const textFieldSx = { width: "100%" };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: isXs ? 2 : 4 }}>
      <Typography variant="h6" mb={2}>
        Pricing & Offers
      </Typography>

      {/* validation / server errors */}
      {errors.map((err, idx) => (
        <Alert key={idx} severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      ))}

      {/* success confirmation */}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setSuccess(false)}>
              OK
            </Button>
          }
        >
          Pricing saved successfully.
        </Alert>
      )}

      <Grid container spacing={3} alignItems="flex-start">
        {/* 12 months price */}
        <Grid item xs={12}>
          <Box sx={fieldWrapperSx}>
            <TextField
              label="12 months price"
              fullWidth
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              value={price12}
              onChange={(e) => setPrice12(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={textFieldSx}
            />
            <FormHelperText sx={{ mt: 1, display: { xs: "none", md: "block" } }}>
              Enter base price for 12 months
            </FormHelperText>
          </Box>
        </Grid>

        {/* 12 months percentage */}
        <Grid item xs={12}>
          <Box sx={fieldWrapperSx}>
            <TextField
              label="12 months apply offer ( % )"
              fullWidth
              type="number"
              inputProps={{ min: 0, max: 100, step: "0.1" }}
              value={offerPercent12}
              onChange={(e) => setOfferPercent12(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              sx={textFieldSx}
            />
            <FormHelperText sx={{ mt: 1, display: { xs: "none", md: "block" } }}>
              Enter discount percentage (0-100). Offer price will be calculated automatically.
            </FormHelperText>
          </Box>
        </Grid>

        {/* 12 months offer price */}
        <Grid item xs={12}>
          <Box sx={fieldWrapperSx}>
            <TextField
              label="12 months offer price"
              fullWidth
              type="number"
              value={offerPrice12}
              disabled
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={textFieldSx}
            />
            <FormHelperText sx={{ mt: 1, display: { xs: "none", md: "block" } }}>
              Automatically calculated from base price and percentage
            </FormHelperText>
          </Box>
        </Grid>

        {/* 3 months price */}
        <Grid item xs={12}>
          <Box sx={fieldWrapperSx}>
            <TextField
              label="3 months price"
              fullWidth
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              value={price3}
              onChange={(e) => setPrice3(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={textFieldSx}
            />
            <FormHelperText sx={{ mt: 1, display: { xs: "none", md: "block" } }}>
              Enter price for 3 months
            </FormHelperText>
          </Box>
        </Grid>

        {/* actions */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" color="inherit" onClick={handleReset} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
