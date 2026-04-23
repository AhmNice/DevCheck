import { useAuthStore } from "../store/authstore";
import { Navigate, useLocation } from "react-router-dom";

type ProtectedProps = {
  children: React.ReactNode;
  requiredRole?: string | string[];
};

const Protected = ({ children, requiredRole }: ProtectedProps) => {
  const { user, loadingUser, isAuthenticated } = useAuthStore();
  const location = useLocation();

  //  Wait for auth check
  if (loadingUser) {
    return <div>Loading...</div>;
  }

  // ❌ Not logged in
  if (!user && !isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{
          from: location,
          message: "Please sign in to access this page",
        }}
      />
    );
  }

  //  Role check (supports multiple roles)
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const accountRole = user?.account_role;

    if (!accountRole || !roles.includes(accountRole)) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  return <>{children}</>;
};

export default Protected;
