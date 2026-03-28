import { HelpCircle, Settings } from "lucide-react";
import React, { useEffect } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import type { UserInterface } from "../../interface/user";
import { MdOutlineVerified } from "react-icons/md";
import { FaSync, FaShieldAlt, FaPlug } from "react-icons/fa";

const authType = {
  github: {
    name: "GitHub",
    text: "Your repositories are now ready for syncing. We've synchronized your environment settings",
  },
  google: {
    name: "Google",
    text: "Your Google account has been successfully linked. You can now enjoy seamless access to your projects and tasks across all your devices.",
  },
};

// Make this dynamic based on actual auth provider or URL params
const type = "github" as const;

const getAuthType = (type: keyof typeof authType) => {
  return authType[type].text;
};

const getAuthTypeName = (type: keyof typeof authType) => {
  return authType[type].name;
};

const SmallProfile = ({ user }: { user: Partial<UserInterface> }) => {
  return (
    <div className="flex items-center gap-6 border-l-2 border-green-600 p-4 rounded-md bg-[#0b1326]">
      <img
        src={
          user.github_avatar_url ||
          user.avatar_url ||
          "https://avatars.githubusercontent.com/u/12345678?v=4"
        }
        alt="Profile"
        className="rounded-full w-12 h-12 object-cover"
      />
      <div className="flex-1">
        <p className="text-[12px] uppercase text-gray-300">
          Authenticated Account
        </p>
        <p className="text-sm text-gray-200 font-medium">
          {user.github_username || user.name || user.email || "User"}
        </p>
      </div>
      <MdOutlineVerified className="text-green-600 text-xl flex-shrink-0" />
    </div>
  );
};

// Feature card component for better reusability
const FeatureCard = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="bg-white backdrop-blur-sm p-4 rounded-lg flex items-center gap-3 border border-gray-100 hover:border-green-200 hover:bg-gray-50 transition-all">
    <span className="text-primary text-xl flex-shrink-0">{icon}</span>
    <span className="font-label text-xs uppercase tracking-wider font-medium text-gray-700">
      {text}
    </span>
  </div>
);
export const AuthHeader = () => {
  const navigate = useNavigate();
  const handleGoToSettings = () => {
    navigate("/setting");
  };
  return (
    <header className="w-full top-0 sticky bg-[#0b1326] flex justify-between items-center px-6 py-4 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <span className="font-headline text-xl font-bold tracking-tighter text-white">
          DevCheck
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/help")}
          className="text-gray-300 hover:text-white transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button
          onClick={handleGoToSettings}
          className="text-gray-300 hover:text-white transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
const AuthSuccess = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  // Auto-redirect to dashboard after 5 seconds
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigate("/dashboard");
  //   }, 5000);

  //   return () => clearTimeout(timer);
  // }, [navigate]);

  // This should come from your auth context/state management
  const user: Partial<UserInterface> = {
    github_username: "JohnDoe",
    github_avatar_url: "https://avatars.githubusercontent.com/u/12345678?v=4",
  };

  // Features data

  const features = [
    {
      icon: <FaSync className="text-primary" />,
      text: "Real-time sync active",
    },
    {
      icon: <FaShieldAlt className="text-primary" />,
      text: "OAuth 2.0 Scoped",
    },
    { icon: <FaPlug className="text-primary" />, text: "Webhook Ready" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <AuthHeader />
      <div className="relative w-full flex flex-col justify-center items-center px-4 py-12">
        {/* Main card */}
        <div className="bg-white backdrop-blur-sm shadow-2xl rounded-lg p-8 max-w-md w-full relative z-10 border border-gray-100">
          <div className="w-full flex items-center justify-center">
            <div className="p-4 rounded-full border-2 border-[#4ae176] ">
              <FaCircleCheck className="text-[#4ae176] text-3xl" />
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-center text-gray-900 text-2xl font-semibold">
              {getAuthTypeName(type)} Authentication Successful!
            </h2>
            <p className="text-center text-gray-500 text-sm mt-3 leading-relaxed">
              {getAuthType(type)}
            </p>
          </div>

          <div className="mt-8">
            <SmallProfile user={user} />
          </div>

          <button
            onClick={handleGoToDashboard}
            className="mt-8 w-full bg-[#0b1326] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1a1f3a] transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#4ae176] focus:ring-offset-2"
          >
            Go to Dashboard
          </button>

          <p className="text-center text-gray-400 text-xs mt-4">
            Redirecting automatically in 5 seconds...
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} text={feature.text} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
