import "./App.css";
import LoginPage from "./pages/loginPage";
import ReviewPage from "./pages/DashBoard";
import ProtectedRoute from "./pages/ProtectedRoute";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import OfferForm from "./pages/priceForm";
import UploadVideoReview from "./pages/uploadVideoReview";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {" "}
          <Route index element={<LoginPage />} />
          <Route
            path="/dash-board"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReviewPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/price-label-form"
            element={
              <ProtectedRoute>
                <Layout>
                  <OfferForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/video-review-upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <UploadVideoReview />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
