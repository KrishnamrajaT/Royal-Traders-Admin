import "./App.css";
import LoginPage from "./pages/loginPage";
import ReviewPage from "./pages/DashBoard";
import ProtectedRoute from "./pages/ProtectedRoute";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";

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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
