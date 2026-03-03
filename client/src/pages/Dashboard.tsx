import StatsCard from "../components/cards/StatsCard";
import { MiniTaskCard } from "../components/cards/TaskCard";
import WeeklyProgressChart from "../components/WeeklyProgressChart";
import DashboardLayout from "../Layout/DashboardLayout";
import { taskData } from "./Tasks";
// import { AreaChart, Area } from "recharts";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 p-8 ">
        <div className="flex flex-col space-y-4">
          <StatsCard />
          <div className="border border-gray-400/20 bg-white shadow-sm rounded-xl flex-1">
            <div className="flex p-4 items-center justify-between border-b border-b-gray-400/20">
              <div className="p-2">
                <h2 className="text-base font-bold text-gray-900">
                  Weekly Progress
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 mb-5">
                  Task completion trends across the current week
                </p>
              </div>
              <button className="bg-gray-400/10 hover:bg-gray-400/20 text-sm hover: font-semibold rounded-md px-4 py-2">
                Current Week
              </button>
            </div>
            <div>
              <WeeklyProgressChart />
            </div>
          </div>
          <div className="flex py-8 flex-col md:flex-row gap-8">
            <div className="border flex-1 p-4 border-gray-400/20 bg-white shadow-sm rounded-xl">
              <h3 className="p-3 font-bold">Recent Tasks</h3>
              <div className="w-full  h-0.5 bg-gray-300/20"></div>
              {taskData.map((task, i) => (
                <div key={i}>
                  <MiniTaskCard
                    tag={task.tag}
                    title={task.title}
                    startDate={task.startDate}
                    endDate={task.endDate}
                  />
                </div>
              ))}
            </div>
            <div className="border flex-1 p-4 border-gray-400/20 bg-white shadow-sm rounded-xl">
              <h3>Upcoming Milestones</h3>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
