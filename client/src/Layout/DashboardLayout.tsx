import { FaBell, FaUser } from "react-icons/fa6";
import { FcSettings } from "react-icons/fc";
import Sidebar from "../components/Sidebar";
import type { PropsWithChildren } from "react";

type DashboardLayoutProps = PropsWithChildren<{}>;

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <div className="flex flex-1 flex-col bg-[#F8FAFC]">
        <div className="flex items-center justify-between bg-white p-6 border-b border-b-gray-200">
          <h3 className="font-semibold">Overview</h3>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <FaBell />
              <FcSettings />
            </div>

            <div className="flex items-center gap-2">
              <h4>Alex Rivea</h4>
              <FaUser />
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
