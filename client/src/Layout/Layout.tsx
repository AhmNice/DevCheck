import { Outlet, useLocation } from "react-router-dom";
import SessionChecker from "../hooks/SessionChecker";
import { useEffect } from "react";
const Layout = () => {
  const location = useLocation();
  useEffect(() => {
    const getPageTitle = () => {
      const path =
        location.pathname === "/" ? "" : location.pathname.split("/").pop();
      const baseTitle = "DevCheck";

      if (location.pathname === "/") {
        return "Welcome to DevCheck";
      }
      const upperPath = path
        ? path.charAt(0).toUpperCase() + path.slice(1)
        : "";

      return path ? `${baseTitle} - ${upperPath}` : baseTitle;
    };

    document.title = getPageTitle();
  }, [location]);
  return (
    <div>
      <main>
        <SessionChecker />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
