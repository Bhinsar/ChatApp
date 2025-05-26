import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import DefaultLayout from "./Layout/DefaultLayout";
import Signup from "./pages/Signup";
import ProtectedRoute from "./Layout/ProtectedRoute";
import {axiosInstance} from "./lib/axois.js";
import { useEffect } from "react";

function Signout() {
  const navigate = useNavigate();

  useEffect(() => {
    const signout = async () => {
      try {
        await axiosInstance.post("/user/signout", {}, { withCredentials: true });
        navigate("/login");
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };
    signout();
  }, []);

  return null; // or a loader
}


function App() {

  return (
    <BrowserRouter>
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
        </Route>
        <Route path="/signout" element={<Signout/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
