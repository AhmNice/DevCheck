import { useState } from "react";
import { FaList } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [darkmode, setDarkmode] = useState(false);
  const navigate = useNavigate();

  const handleToogle = () => {
    setDarkmode((prevMode) => !prevMode);
  };

  return (
    <header className="px-4 md:px-20 lg:px-40 lg:py-4 flex items-center justify-between bg-[#F8FAFC] shadow-md shadow-black/10 whitespace-nowrap">
      <div className="flex max-w-[1200px] mx-auto items-center justify-between flex-1">
        <div className="flex items-center gap-2">
          <div className="size-8 flex items-center justify-center bg-blue-700 text-black rounded-lg">
            <span className="material-symbols-outlined text-xl">
              <FaList />
            </span>
          </div>
          <h1 className="text-[#0d121b] text-xl font-bold leading-tight tracking-[-0.015em]">
            DevChecklist
          </h1>
        </div>
        <div className="flex space-x-3 items-center ">
          <nav>
            <ul className="flex items-center gap-2">
              <li className="text-[#4c669a] hover:text-primary transition-colors text-sm font-medium">
                Docs
              </li>
              <li className="text-[#4c669a] hover:text-primary transition-colors text-sm font-medium">
                Features
              </li>
              <li className="text-[#4c669a] hover:text-primary transition-colors text-sm font-medium">
                GitHub
              </li>
            </ul>
          </nav>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("login")}
              className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-gray-200  text-[#0d121b] text-sm font-bold transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              <span>Login</span>
            </button>
            <button className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-[#135bec] text-white text-sm font-bold transition-transform hover:scale-[1.02]">
              <span>Sign Up Free</span>
            </button>
          </div>
          <div>
            <button className="cursor-pointer" onClick={handleToogle}>
              {darkmode ? "🌙" : "☺"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
