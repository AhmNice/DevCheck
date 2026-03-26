import { UserPlus } from "lucide-react";
import DashboardLayout from "../Layout/DashboardLayout";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authstore";

const Setting = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    jobTitle: user?.jobTitle || "",
    email: user?.email || "",
    biography: user?.bio || "",
  });
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      jobTitle: user?.jobTitle || "",
      email: user?.email || "",
      biography: user?.bio || "",
    });
  }, [user]);
   const jobTitle = user?.jobTitle?.replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Not specified";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      try {
        console.log("Form data saved:", formData);
        setIsSaving(false);
      } catch (error) {
        console.log(error);
        setIsSaving(false);
      }
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="relative">
        <div className="flex flex-col p-2 border-b border-b-gray-400/20">
          <div className="py-3">
            <h2 className="text-xl font-bold text-gray-900">
              Profile Settings
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Keep your developer profile up to date and manage your visibility.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row bg-white p-4 shadow-sm rounded-lg mt-6 md:items-center items-start gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-gray-400/80 border-4 border-gray-400/10 text-white">
              <UserPlus size={32} />
            </div>
            <div>
              <h3 className="font-semibold text-base">{user?.name || "user"}</h3>
              <p className="text-xs text-gray-600">
                {jobTitle} 
              </p>
            </div>
          </div>
          <button className="bg-blue-500 px-3 py-1.5 cursor-pointer hover:bg-blue-700 duration-200 delay-150 rounded-md text-white text-sm">
            Change Avatar
          </button>
        </div>

        <div className="bg-white p-5 shadow-sm rounded-lg mt-6">
          <div>
            <h3 className="font-semibold text-base">Personal Information</h3>
            <p className="text-xs text-gray-500">
              Your information is used for team collaboration.
            </p>
          </div>
          <div className="border-b border-b-gray-400/20 mt-3 mb-3"></div>

          <div>
            <form onSubmit={handleSave}>
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6">
                <div className="flex flex-1 flex-col gap-1.5 pb-2 w-full">
                  <label
                    htmlFor="name"
                    className="text-xs font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border border-gray-400/30 w-full text-sm text-black bg-gray-400/10 indent-1 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Your name ..."
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5 pb-2 w-full">
                  <label
                    htmlFor="jobTitle"
                    className="text-xs font-medium text-gray-700"
                  >
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="border border-gray-400/30 w-full text-sm text-black bg-gray-400/10 indent-1 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Senior Product Designer"
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 pb-2 mt-3">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border border-gray-400/30 w-full text-sm text-black bg-gray-400/10 indent-1 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="alex.rivera@DevCheck.com"
                />
              </div>

              <div className="flex flex-1 flex-col gap-1.5 pb-2 mt-3">
                <label
                  htmlFor="biography"
                  className="text-xs font-medium text-gray-700"
                >
                  Biography
                </label>
                <textarea
                  id="biography"
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  rows={4}
                  className="border border-gray-400/30 w-full text-sm text-black bg-gray-400/10 indent-1 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Passionate about building developer experience tools and clean UI architectures."
                />
              </div>

              <div className="flex items-center gap-3 w-full justify-end mt-4">
                <button
                  type="button"
                  className="flex-1 md:flex-none px-5 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                  onClick={() => {
                    setFormData({
                      name: "",
                      jobTitle: "",
                      email: "",
                      biography: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={isSaving}
                  type="submit"
                  className="flex-1 md:flex-none px-6 py-2 rounded-lg font-medium text-sm bg-blue-700 text-white hover:bg-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Saving</span>
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white p-5 shadow-sm rounded-lg mt-6">
          <div>
            <h3 className="font-semibold text-base">
              Notification Preferences
            </h3>
            <p className="text-xs text-gray-500">
              Decide how you want to be notified about task updates.
            </p>
          </div>
          <div className="border-b border-b-gray-400/20 mt-3 mb-3"></div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-gray-500">
                  Receive updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  onChange={(e) =>
                    console.log("Email notifications:", e.target.checked)
                  }
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-2.5"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-gray-500">
                  Receive updates in browser
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                  onChange={(e) =>
                    console.log("Push notifications:", e.target.checked)
                  }
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-2.5"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Setting;
