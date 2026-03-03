import { FaChessBoard, FaList } from "react-icons/fa6";
import { FcBarChart, FcImport, FcParallelTasks } from "react-icons/fc";
import type { IconType } from "react-icons";
import { NavLink } from "react-router-dom";
import { useState } from "react";

interface SideBarProps {
  icon: IconType;
  text: string;
  path: string;
}

const sidebarData: SideBarProps[] = [
  {
    icon: FaChessBoard,
    text: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: FcParallelTasks,
    text: "Project Tesks",
    path: "/task",
  },
  {
    icon: FcImport,
    text: "Import",
    path: "/import",
  },
  {
    icon: FcBarChart,
    text: "Analytics",
    path: "/analytics",
  },
];

const Sidebar = () => {
  // const [active, setActive] = useState()
  return (
    <div>
      <div className="bg-white p-6 border-r border-r-gray-400/10">
        <div className="flex items-center gap-2 p-3">
          <FaList />
          <h3 className="font-bold">DevCheckList</h3>
        </div>

        <div className="space-y-2 mt-3">
          {sidebarData.map((sidebar, i) => {
            const Icon = sidebar.icon;
            return (
              <NavLink
                to={sidebar.path}
                key={i}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                <Icon className="text-lg" />
                <span className="font-medium">{sidebar.text}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
