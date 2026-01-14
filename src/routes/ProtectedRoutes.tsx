import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import authService from "../features/auth/authService";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = authService.isAuthenticated()
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute