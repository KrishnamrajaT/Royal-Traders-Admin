import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  FormHelperText,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";

export default function UploadVideoReview({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoURL] = useState("");
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const validate = () => {
    const errs = [];
    if (!title.trim()) errs.push("Title is required.");
    if (!videoUrl.trim()) {
      errs.push("Video URL is required.");
    } else {
      try {
        const u = new URL(videoUrl);
        if (!["http:", "https:"].includes(u.protocol)) {
          errs.push("URL must use http or https.");
        }
      } catch {
        errs.push("Please enter a valid URL.");
      }
    }
    return errs;
  };

  const handleReset = () => {
    setTitle("");
    setVideoURL("");
    setErrors([]);
    setSuccess(false);
  };

  const postVideo = async (payload) => {
    const url = "https://royal-traders-5euy.vercel.app/videoreview";
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      let errText = resp.statusText;
      try {
        const json = await resp.json();
        errText = json.message || JSON.stringify(json);
      } catch {
        /* ignore parse error */
      }
      throw new Error(errText || `Request failed with status ${resp.status}`);
    }
    return resp.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    const validation = validate();
    if (validation.length) {
      setErrors(validation);
      return;
    }

    const payload = { title: title.trim(), videoUrl: videoUrl.trim() };
    setIsSubmitting(true);

    try {
      // if parent handler provided, call it first (allows mocking/testing)
      if (onSubmit) await onSubmit(payload);

      // send to API
      await postVideo(payload);

      setSuccess(true);
      // short delay to show success then route to dashboard
      setTimeout(() => navigate("/dash-board", { replace: true }), 700);
    } catch (err) {
      setErrors([err?.message || "Failed to save video."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: isXs ? 2 : 4,
        width: "100%",
        maxWidth: 780,
        mx: "auto",
      }}
      noValidate
    >
      <Typography variant="h6" mb={2}>
        Upload Video Review
      </Typography>

      {errors.length > 0 &&
        errors.map((err, i) => (
          <Alert key={i} severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        ))}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Video saved — redirecting to dashboard...
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            inputProps={{ maxLength: 120 }}
            sx={{ width: "100%" }}
          />
          <FormHelperText sx={{ mt: 1, display: { xs: "none", md: "block" } }}>
            Provide a short descriptive title (max 120 chars).
          </FormHelperText>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoURL(e.target.value)}
            fullWidth
            required
            placeholder="https://..."
            sx={{ width: "100%" }}
          />
          <FormHelperText sx={{ mt: 1, display: { xs: "none", md: "block" } }}>
            Paste the full URL (http/https). You can add YouTube/Vimeo links.
          </FormHelperText>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            type="button"
            variant="outlined"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}