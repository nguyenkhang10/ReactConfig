import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export default function ProtectedRoute() {
    const token = useAppSelector((state) => state.auth.token);  // peek in the drawer

    // Has a key? Come in. No key? Go back to Login.
    return token ? <Outlet /> : <Navigate to="/" replace />;
}