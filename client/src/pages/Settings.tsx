import React, { useState } from "react";
import { Moon, Sun } from "lucide-react";
import DashboardLayout from "../Layout/DashboardLayout";
import {
  resolveInitialTheme,
  setThemePreference,
  type Theme,
} from "../util/theme";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authstore";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme());
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const {user} = useAuthStore()
  const navigate = useNavigate();
  const isDarkMode = theme === "dark";

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password update logic here
    console.log("Updating password:", passwordData);
  };

  const handleThemeToggle = (checked: boolean) => {
    const nextTheme: Theme = checked ? "dark" : "light";
    setTheme(nextTheme);
    setThemePreference(nextTheme);
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b border-b-gray-400/20">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account preferences</p>
      </div>

      {/* Settings Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 text-base">
                Appearance
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Choose the interface style that works best for your eyes
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                    {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Dark Theme
                    </p>
                    <p className="text-xs text-gray-500">
                      {isDarkMode
                        ? "Dark mode is active across the app"
                        : "Switch to dark mode for low-light environments"}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isDarkMode}
                    onChange={(e) => handleThemeToggle(e.target.checked)}
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Password Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 text-base">
                Password Management
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Update your password to keep your account secure
              </p>
            </div>
            <form onSubmit={handlePasswordUpdate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 text-base">
                Connected Accounts
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Link your account with third-party services
              </p>
            </div>
            <div className="p-6 space-y-4">
              {/* GitHub Connection */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.22-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.86 1.23 1.09 1.83 2.835 1.315 3.525 1 .105-.78.42-1.315.765-1.615-2.67-.3-5.46-1.335-5.46-5.925 0-1.31.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">GitHub</p>
                    <p className="text-sm text-gray-500">
                      Connect your GitHub account
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/settings/connect/github")}
                  className={`${user && user.github_connected ? 'px-4 py-2 text-sm font-medium text-white bg-primary border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors' : 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'}`}
                >
                  {user && user.github_connected ? "Manage" : "Connect"}
                </button>
              </div>

              {/* Google Connection */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Google</p>
                    <p className="text-sm text-gray-500">
                      Connect your Google account
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/settings/connect/google")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Notifications
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure how you receive notifications
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    Receive updates and alerts via email
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked="false"
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Toggle email notifications</span>
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Push Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    Receive push notifications in browser
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked="false"
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Toggle push notifications</span>
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive important alerts via text message
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked="false"
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Toggle SMS notifications</span>
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Account Deletion */}
          <div className="bg-white  rounded-lg shadow-sm border border-red-200 dark:border-red-800">
            <div className="p-6 border-b border-red-200 dark:border-red-800">
              <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
                Account Deletion
              </h2>
              <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. This
                action is irreversible and will permanently remove all your
                data.
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors dark:focus:ring-offset-gray-800"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you absolutely sure? This action cannot be undone.",
                    )
                  ) {
                    console.log("Account deletion requested");
                  }
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
