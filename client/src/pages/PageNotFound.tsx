import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, AlertTriangle, Search } from "lucide-react";
import { useState } from "react";

const PageNotFound = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search or redirect to search page
    console.log("Searching for:", searchValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-6">
          <h1 className="text-8xl md:text-9xl  text-gray-900 select-none">
            404
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl -z-10"></div>
        </div>

        {/* Error Message */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full w-fit mx-auto">
            <AlertTriangle size={16} />
            <span className="text-xs font-medium">Page Not Found</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Looks like you're lost
          </h2>

          <p className="text-sm text-gray-500 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
        </div>



        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            <Home size={16} className="group-hover:scale-110 transition-transform" />
            Go to Dashboard
          </button>
        </div>

        {/* Helpful Links */}
        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 mb-3">Popular pages you might be looking for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Dashboard", "Tasks", "Team", "Analytics", "Settings"].map((page) => (
              <button
                key={page}
                onClick={() => navigate(`/${page.toLowerCase()}`)}
                className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-lg hover:bg-gray-100 transition-colors"
              >
                {page}
              </button>
            ))}
          </div>
        </div>

        {/* Error Code */}
        <p className="mt-6 text-[10px] text-gray-300 font-mono">
          Error 404 | Page Not Found | {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PageNotFound;