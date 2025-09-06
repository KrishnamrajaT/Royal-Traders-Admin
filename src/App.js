import "./App.css";
import LoginPage from "./pages/loginPage";
import  ReviewPage  from "./pages/DashBoard";
import  ProtectedRoute  from "./pages/ProtectedRoute";
import { BrowserRouter, Route, Routes } from "react-router-dom";

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
                <ReviewPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
