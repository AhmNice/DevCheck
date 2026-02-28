import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div className="space-y-3">
        Unexpected Application Error! 404
        <h1 className="text-7xl font-bold">404</h1>
        <p>Not Found</p>
        <button
          className="px-4 py-2 bg-blue-700  text-white font-bold rounded-2xl shadow-blue-300"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
