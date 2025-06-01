import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import DefaultLayout from "./Layout/DefaultLayout";
import Signup from "./pages/Signup";
import ProtectedRoute from "./Layout/ProtectedRoute";
import Profile from "./pages/Profile";
import Setting from "./pages/Setting";
import { useEffect } from "react";

function App() {
  let theme;
  useEffect(() => {
    theme = localStorage.getItem("theme");
    if (!theme) {
      localStorage.setItem("theme", "light");
    }
  }, [])

  return (
    <BrowserRouter data-theme = {theme} > 
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedRoute>
              <Signup />
            </ProtectedRoute>
          }
        />
        <Route element={<DefaultLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Setting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
