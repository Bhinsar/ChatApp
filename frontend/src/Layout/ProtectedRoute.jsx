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
        const response = await axiosInstance.post(
          "/user/check",
          {},
          { withCredentials: true }
        );
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.log(err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if(location.pathname === "/login" && isAuthenticated) return <Navigate to="/home" replace/>
  if(location.pathname === "/signup" && isAuthenticated) return <Navigate to="/home" replace/>

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
  
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
