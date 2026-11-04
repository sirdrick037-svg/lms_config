
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isLoggedIn = Boolean(
    localStorage.getItem("access_token")
  );

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
