import { Bell, Settings, Search, Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import type { PropsWithChildren } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

type DashboardLayoutProps = PropsWithChildren;

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split("/").filter((seg) => seg !== "");

    if (segments.length === 0 || segments[0] === "dashboard") {
      return {
        main: "Dashboard",
        sub: "Overview",
      };
    }

    // Capitalize first letter and format the segment
    const formatSegment = (segment: string) => {
      const decodedSegment = (() => {
        try {
          return decodeURIComponent(segment);
        } catch {
          return segment;
        }
      })();

      return decodedSegment
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .replace(/^\d+/, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim(); // Remove leading numbers and special characters
    };

    const main = formatSegment(segments[0]);
    const sub = segments.length > 1 ? formatSegment(segments[1]) : "";

    return { main, sub };
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />

      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${isSidebarCollapsed ? "md:ml-20" : "md:ml-72"}
        `}
      >
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const event = new CustomEvent("toggleMobileSidebar");
                  window.dispatchEvent(event);
                }}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <div>
                <h3 className="font-semibold text-gray-800">
                  Welcome back, Maxy
                </h3>
                <p className="text-xs text-gray-500 md:hidden">
                  Product Manager
                </p>
              </div>

              <span className="hidden md:inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100">
                Pro Account
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              <button
                onClick={() => navigate("/setting")}
                className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              <div className="hidden md:flex items-center gap-2 ml-2 border-l border-gray-200 pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Alex Rivea
                  </p>
                  <p className="text-xs text-gray-500">Product Manager</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                  AR
                </div>
              </div>

              <div className="md:hidden w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                AR
              </div>
            </div>
          </div>

          {/* Desktop Breadcrumbs */}
          <div className="hidden md:block px-6 py-2 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Pages</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600 font-medium">
                {breadcrumbs.main}
              </span>
              {breadcrumbs.sub && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-400">{breadcrumbs.sub}</span>
                </>
              )}
            </div>
          </div>

          {/* Mobile Breadcrumbs - Dynamic based on path */}
          <div className="md:hidden px-4 py-2 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-600 font-medium">
                {breadcrumbs.main}
              </span>
              {breadcrumbs.sub && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-400">{breadcrumbs.sub}</span>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        <footer className="py-4 px-4 md:px-6 border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
              <p>© 2024 DevCheck. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-gray-700 transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-gray-700 transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-gray-700 transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
