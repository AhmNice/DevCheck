import { FaBell, FaUser } from "react-icons/fa6";
import { FcSettings } from "react-icons/fc";
import Sidebar from "../components/Sidebar";
import type { PropsWithChildren } from "react";

type DashboardLayoutProps = PropsWithChildren<{}>;

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex ">
      <Sidebar />
      <div className="flex-1 items-center justify-between bg-[#F8FAFC]">
        <div className="flex flex-col ">
          <div className="flex  bg-white p-6 border-b border-b-gray-400/20 items-center justify-between">
            <h3>Overview</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span>
                  <FaBell />
                </span>
                <span>
                  <FcSettings />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h4>Alex Rivea</h4>
                <FaUser />
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
