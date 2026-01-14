import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import authService from "../features/auth/authService";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = authService.isAuthenticated()
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
};

export default PublicRoute