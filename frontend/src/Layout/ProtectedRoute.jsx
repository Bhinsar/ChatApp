import { Navigate, useLocation } from "react-router-dom";
import { axiosInstance } from "../lib/axois";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.post("/user/check", {}, { withCredentials: true });
        setIsAuthenticated(response.status === 200);
      } catch (err) {
        console.log(err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  // Handle public routes when authenticated
  if (isAuthenticated && (location.pathname === "/login" || location.pathname === "/signup")) {
    return <Navigate to="/home" replace />;
  }

  // Handle protected routes when not authenticated
  if (!isAuthenticated && location.pathname !== "/login" && location.pathname !== "/signup") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
