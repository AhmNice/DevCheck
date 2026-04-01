import React, { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "../Layout/DashboardLayout";
import { useAuthStore } from "../store/authstore";
import Repo from "../components/Repo";
import GithubPermission from "../components/GithubPermission";
import { notify } from "../util/notify";

const GithubConnection: React.FC = () => {
  const { user, refreshUser } = useAuthStore();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const popupCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    setConnecting(false);
    if (popupCheckIntervalRef.current) {
      clearInterval(popupCheckIntervalRef.current);
      popupCheckIntervalRef.current = null;
    }
    window.removeEventListener("message", handleMessage);
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.source?.includes("react-devtools")) return;
      const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;
      // Validate message origin
      if (event.origin !== CLIENT_URL) return;
      const { success, token, userId, error } = event.data;
      console.log("Received message from popup:", event.data);
      if (success) {
        notify.success("GitHub account connected successfully!");
        // Refresh user data to update connection status
        refreshUser?.();
        cleanup();
      } else {
        notify.error(error || "Failed to connect GitHub account.");
        cleanup();
      }
    },
    [cleanup, refreshUser],
  );

  const handleConnectGithub = async () => {
    if (connecting) return;
    setConnecting(true);

    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const authWindow = window.open(
      `${import.meta.env.VITE_SERVER_URL}/auth/connect/github`,
      "GitHub Authentication",
      `width=${width},height=${height},top=${top},left=${left}`,
    );

    if (!authWindow) {
      notify.error("Popup blocked. Please allow popups for this site.");
      setConnecting(false);
      return;
    }
    popupRef.current = authWindow;
    // Add message event listener
    window.addEventListener("message", handleMessage);
    // Check if popup is closed by user
    popupCheckIntervalRef.current = setInterval(() => {
      if (authWindow.closed) {
        console.log("Popup closed by user");
        if (connecting) {
          setConnecting(false);
          notify.info("GitHub connection cancelled.");
        }
        cleanup();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    if (disconnecting) return;
    setDisconnecting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/disconnect/github`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        notify.success("GitHub account disconnected successfully!");
        refreshUser?.();
      } else {
        const data = await response.json();
        notify.error(data.error || "Failed to disconnect GitHub account.");
      }
    } catch (error) {
      notify.error("Failed to disconnect GitHub account.");
    } finally {
      setDisconnecting(false);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-900">GitHub Connection</h2>
          <p className="text-xs text-gray-500">
            Connect your GitHub account to import repositories, track issues,
            and manage your projects seamlessly. By connecting, you can easily
            sync your work and stay organized across platforms.
          </p>
        </div>

        {/* GitHub Connection Card */}
        <div className="bg-white shadow-sm rounded-md p-4 flex gap-6 items-center">
          <div className="w-16 h-14 rounded-sm overflow-hidden">
            <img
              className="cover w-full h-full"
              src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              alt="GitHub Logo"
            />
          </div>
          <div className="flex justify-between items-center p-4 w-full transition-colors">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                {user?.github_connected
                  ? "GitHub Account Connected"
                  : "Connect GitHub Account"}
              </h3>
              <div className="flex items-center gap-2">
                {user?.github_connected && (
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                <p className="text-xs text-gray-500">
                  {user?.github_connected ? (
                    <>
                      Authenticated as{" "}
                      <span className="text-primary font-medium">
                        @{user?.github_username || user?.name || "user"}
                      </span>
                    </>
                  ) : (
                    "Connect your GitHub account to enable additional features"
                  )}
                </p>
              </div>
            </div>
            <div>
              {user?.github_connected ? (
                <button
                  className="px-4 py-2 rounded-md text-xs font-medium transition-colors bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded-md text-xs font-medium transition-colors bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={handleConnectGithub}
                  disabled={connecting}
                >
                  {connecting ? "Connecting..." : "Connect GitHub"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Repositories and Permissions List */}
        {user?.github_connected ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Repo user={user} />
            <GithubPermission user={user} />
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please connect your GitHub account to view repositories and manage
              permissions.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GithubConnection;
