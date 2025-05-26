import Navbar from "../components/Navbar"
import { Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

function DefaultLayout() {
  return (
    <ProtectedRoute>
        <Navbar/>
        <Outlet/>
    </ProtectedRoute>
  )
}

export default DefaultLayout
