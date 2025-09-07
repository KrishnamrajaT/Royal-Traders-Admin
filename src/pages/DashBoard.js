import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  useMediaQuery,
  useTheme,
  styled,
  Skeleton,
  Button,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import dayjs from "dayjs";
import CustomPagination from "../components/CustomePagination";
import { useNavigate } from "react-router-dom";

// Styled components using the styled API
const ReviewCard = styled(Card)(({ theme }) => ({
  height: "100%",
}));

const ReviewPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [reviews, setReviews] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const reviewsPerPage = isMobile ? 3 : 9;
  const sortedData = [...(reviews || [])].sort((a, b) => a.rating - b.rating);

  const currentReviews = sortedData?.slice(
    (reviewsPage - 1) * reviewsPerPage,
    reviewsPage * reviewsPerPage
  );
  setTimeout(() => {
    setIsGlobalLoading(false);
  }, 2000);
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  let REVIEW_URL = "https://royal-traders-5euy.vercel.app/rating";
  const fetchReviews = () => {
    setIsLoading(true);

    axios
      .get(REVIEW_URL)
      .then((res) => {
        console.log(res.data);
        setReviews(res.data);
        setIsLoading(false);
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(true));
  };
  useEffect(() => {
    fetchReviews();
  }, [isRefresh]);

  const deleteReview = (id) => {
    axios
      .delete(`${REVIEW_URL}/${id}`)
      .then((res) => {
        setIsRefresh(!isRefresh);
        setSuccess(true);
      })
      .catch((err) => {
        console.log(err);
        setServerError("Something went wrong! Try again later.");
      });
    setTimeout(() => {
      setSuccess(false);
      setServerError("");
    }, 3000);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          //   background: `linear-gradient(45deg, #2563eb 0%, #1e40af 100%)`,
          //   color: theme.palette.common.white,
          padding: "34px 8px 34px 8px",
          textAlign: "center",
        }}
      >
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Delete successful!
          </Alert>
        )}
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          {isLoading && isGlobalLoading ? (
            <Skeleton variant="rectangular" width={100} height={35} />
          ) : (
            <>
              <Button
                variant="contained"
                endIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
        {!isLoading && (
          <Typography
            sx={{
              fontSize: {
                xs: "30px",
                sm: "2.4rem",
                md: "3rem",
              },
              paddingTop: "33px",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
            component="h1"
            gutterBottom
          >
            Manage Client Reviews
          </Typography>
        )}
      </Box>

      <Box maxWidth="lg" mx="auto">
        {/* Reviews Section */}
        <Box mb={3}>
          <Box>
            <Box sx={{ width: "100%" }}>
              <Grid
                container
                spacing={3}
                sx={{
                  // Explicitly define grid layout for 3 rows
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)", // 1 column on mobile
                    sm: "repeat(2, 1fr)", // 2 columns on tablet
                    md: "repeat(3, 1fr)", // 3 columns on desktop
                  },
                  gridAutoRows: "1fr", // Equal row height
                  gap: 3, // Consistent spacing
                }}
              >
                {currentReviews?.map((review) => (
                  <Grid
                    item
                    key={review.id}
                    sx={{
                      display: "flex",
                      minHeight: "300px", // Fixed minimum height per card
                    }}
                  >
                    <ReviewCard
                      sx={{
                        width: "100%",
                        height: "100%", // Fill grid cell
                        border: "1px solid #e0e",
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        {/* Review content */}
                        <Box display="flex" alignItems="center" mb={2}>
                          {/* <Avatar
                            src={review.avatar}
                            sx={{ width: 56, height: 56, mr: 2 }}
                          /> */}
                          <Box
                            display={"flex"}
                            justifyContent={"space-between"}
                          >
                            <Box>
                              {isLoading && isGlobalLoading ? (
                                <>
                                  <Skeleton
                                    variant="rectangular"
                                    width={350}
                                    height={30}
                                    sx={{ mb: 1 }}
                                  />
                                  <Skeleton
                                    variant="rectangular"
                                    width={200}
                                    height={30}
                                  />
                                </>
                              ) : (
                                <>
                                  <Typography fontWeight="bold">
                                    {review.name}
                                  </Typography>
                                  <Typography>
                                    {dayjs(review.createdAt).format(
                                      "YYYY-MM-DD"
                                    )}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        <Box
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                        >
                          {isLoading && isGlobalLoading ? (
                            <Skeleton
                              variant="rectangular"
                              width={220}
                              height={20}
                            />
                          ) : (
                            <Rating
                              value={review.rating}
                              precision={0.5}
                              readOnly
                            />
                          )}
                          {isLoading && isGlobalLoading ? (
                            <Skeleton
                              variant="rectangular"
                              width={100}
                              height={30}
                            />
                          ) : (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              endIcon={<DeleteIcon />}
                              onClick={() => deleteReview(review._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>
                        <Typography
                          variant="body1"
                          fontStyle="italic"
                          sx={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            paddingTop: "10px",
                          }}
                        >
                          {isLoading && isGlobalLoading ? (
                            <>
                              {Array.from({ length: 4 }).map((_, idx) => (
                                <Skeleton
                                  key={idx}
                                  variant="rectangular"
                                  width={500}
                                  height={30}
                                  sx={{ mb: 1 }}
                                />
                              ))}
                            </>
                          ) : (
                            review.message
                          )}
                        </Typography>
                      </CardContent>
                    </ReviewCard>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Add pagination controls for reviews */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              {!isLoading && (
                <CustomPagination
                  count={Math.ceil(reviews?.length / reviewsPerPage)}
                  page={reviewsPage}
                  onChange={(event, page) => setReviewsPage(page)}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ReviewPage;
