import { Outlet } from "react-router-dom";
import SessionChecker from "../hooks/SessionChecker";
const Layout = () => {
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
