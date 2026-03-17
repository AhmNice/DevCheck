import {
  LayoutDashboard,
  List,
  ListChecks,
  Import,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Search,
  Star,
  Users,
  ChevronDown,
  FolderOpen,
  ClipboardList,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { APP_VERSION } from "../util/version";

interface SidebarItem {
  icon: React.ElementType;
  text: string;
  path?: string;
  children?: SidebarItem[];
}

interface SidebarProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const sidebarData: SidebarItem[] = [
  {
    icon: LayoutDashboard,
    text: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: ListChecks,
    text: "Project Tasks",
    children: [
      {
        icon: ClipboardList,
        text: "All Tasks",
        path: "/task",
      },
      {
        icon: FolderOpen,
        text: "Projects",
        path: "/projects",
      },
    ],
  },
  {
    icon: Users,
    text: "Team",
    path: "/team",
  },
  {
    icon: BarChart3,
    text: "Analytics",
    path: "/analytics",
  },
  {
    icon: Import,
    text: "Import",
    path: "/import",
  },
];

const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  // Handle mobile sidebar toggle event
  useEffect(() => {
    const handleToggleMobile = () => {
      setIsMobileOpen(true);
    };

    window.addEventListener("toggleMobileSidebar", handleToggleMobile);
    return () => {
      window.removeEventListener("toggleMobileSidebar", handleToggleMobile);
    };
  }, []);

  // Handle resize to auto-close mobile sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSubmenu = (text: string) => {
    setOpenSubmenu(openSubmenu === text ? null : text);
  };

  const renderMenuItem = (item: SidebarItem, index: number) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSubmenu === item.text;

    if (hasChildren) {
      return (
        <div key={index} className="space-y-1">
          <button
            onClick={() => !isCollapsed && toggleSubmenu(item.text)}
            className={`
              flex items-center w-full ${isCollapsed ? "justify-center" : "gap-3"}
              px-3 py-3 rounded-xl transition-all group relative
              text-gray-600 hover:bg-gray-100
            `}
          >
            <Icon
              className={`w-5 h-5 ${isCollapsed ? "" : "flex-shrink-0"} text-gray-600`}
            />
            {!isCollapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">
                  {item.text}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                {item.text}
              </span>
            )}
          </button>

          {!isCollapsed && isOpen && (
            <div className="pl-9 space-y-1">
              {item.children?.map((child, childIndex) => {
                const ChildIcon = child.icon;
                return (
                  <NavLink
                    key={childIndex}
                    to={child.path!}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setIsMobileOpen(false);
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <ChildIcon
                          className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-600"}`}
                        />
                        <span className="text-sm font-medium flex-1">
                          {child.text}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={index}
        to={item.path!}
        onClick={() => {
          if (window.innerWidth < 768) {
            setIsMobileOpen(false);
          }
        }}
        className={({ isActive }) =>
          `flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-xl transition-all group relative ${
            isActive
              ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-600 border border-blue-200/50"
              : "text-gray-600 hover:bg-gray-100"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={`w-5 h-5 ${isCollapsed ? "" : "flex-shrink-0"} ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            />
            {!isCollapsed && (
              <span className="text-sm font-medium flex-1">{item.text}</span>
            )}
            {!isCollapsed && isActive && (
              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                {item.text}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-xl
          transition-all duration-300 z-50
          ${isCollapsed ? "w-20" : "w-72"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Collapse toggle button (desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all hidden md:block z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Close button (mobile) */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute right-4 top-4 md:hidden z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        )}

        {/* Logo section */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} p-6 border-b border-gray-100`}
        >
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-md shadow-blue-500/20">
              <List className="w-6 h-6 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div>
              <h3 className="font-bold text-gray-800 text-lg">DevCheck</h3>
              <p className="text-xs text-gray-500">v{APP_VERSION}</p>
            </div>
          )}
        </div>

        {/* Search bar */}
        {!isCollapsed && (
          <div className="px-4 mt-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Main menu */}
        <div className="px-3 mt-6 overflow-y-auto max-h-[calc(100vh-300px)]">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </p>
          )}

          <div className="space-y-1">
            {sidebarData.map((item, index) => renderMenuItem(item, index))}
          </div>

          {/* Favorites section */}
          {!isCollapsed && (
            <div className="mt-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Favorites
              </p>
              <div className="space-y-1">
                <button className="flex items-center gap-3 px-3 py-2 w-full text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>Monthly Report</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 w-full text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>Team Meeting</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 bg-white">
          {/* Settings/Help buttons */}
          <div className="px-3 mb-4">
            {isCollapsed ? (
              <div className="space-y-1">
                <button
                  onClick={() => navigate("/setting")}
                  className="flex justify-center p-3 cursor-pointer text-gray-600 hover:bg-gray-100 rounded-xl w-full transition-colors relative group"
                >
                  <Settings className="w-5 h-5" />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    Settings
                  </span>
                </button>
                <button className="flex justify-center p-3 cursor-pointer text-gray-600 hover:bg-gray-100 rounded-xl w-full transition-colors relative group">
                  <HelpCircle className="w-5 h-5" />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    Help
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/setting")}
                  className="flex-1 flex items-center justify-center cursor-pointer gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <button className="flex-1 flex items-center justify-center cursor-pointer gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-sm">Help</span>
                </button>
              </div>
            )}
          </div>

          {/* User profile */}
          <div
            className={`p-4 border-t border-gray-100 bg-gradient-to-b from-transparent to-gray-50/50 ${isCollapsed ? "text-center" : ""}`}
          >
            <div
              className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-md text-sm">
                  AR
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">
                      Alex Rivea
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Product Manager
                    </p>
                  </div>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors group flex-shrink-0">
                    <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle button - only show when sidebar is closed */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-4 right-4 md:hidden bg-blue-500 text-white p-3 rounded-full shadow-lg z-40"
        >
          <List className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
