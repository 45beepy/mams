import { Navigate } from 'react-router-dom';
import { useAuth } from '/src/context/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
