import StatsCard from "../components/cards/StatsCard";
import { MiniTaskCard, type taskProps } from "../components/cards/TaskCard";
import WeeklyProgressChart from "../components/WeeklyProgressChart";
import DashboardLayout from "../Layout/DashboardLayout";
// import { AreaChart, Area } from "recharts";

const taskData: taskProps[] = [
  {
    tag: "HIGH PRIORITY",
    title: "Refactor Auth Middleware",
    description:
      "Ensure OAuth providers are correctly handled in the new microservices architecture and update dependencies",
    percentage: 60,
    startDate: "Oct 24",
    endDate: "Nov 18",
    subtaskData: [
      {
        id: 1,
        title: "Setup Google Cloud Console credentials",
        completed: false,
      },
      {
        id: 2,
        title: "Configure redirect URIs for development environment",
        completed: false,
      },
      {
        id: 3,
        title: "Implement Passport.js strategy for GitHub",
        completed: false,
      },
    ],
  },
  {
    tag: "MEDIUM PRIORITY",
    title: "Design System Audth",
    description:
      "Review the current Figma components against the production React library for visual consistency.",
    percentage: 20,
    startDate: "Oct 24",
    endDate: "Nov 18",
    subtaskData: [
      {
        id: 1,
        title: "Setup Google Cloud Console credentials",
        completed: false,
      },
      {
        id: 2,
        title: "Configure redirect URIs for development environment",
        completed: false,
      },
    ],
  },
  {
    tag: "LOW PRIORITY",
    title: "Update Documentation",
    description:
      "Refresh the README and API references to reflect the recent endpoint changes in v2.4.",
    percentage: 95,
    startDate: "Oct 24",
    endDate: "Nov 18",
    subtaskData: [
      {
        id: 1,
        title: "Setup Google Cloud Console credentials",
        completed: false,
      },
      {
        id: 2,
        title: "Configure redirect URIs for development environment",
        completed: false,
      },
      {
        id: 3,
        title: "Implement Passport.js strategy for GitHub",
        completed: false,
      },
    ],
  },
  {
    tag: "HIGH PRIORITY",
    title: "Server Migration",
    description:
      "Move current staging environment to AWS us-east-1 and verify database latency benchmarks.",
    percentage: 45,
    startDate: "Oct 30",
    endDate: "Nov 18",
    subtaskData: [
      {
        id: 1,
        title: "Setup Google Cloud Console credentials",
        completed: false,
      },
      {
        id: 2,
        title: "Configure redirect URIs for development environment",
        completed: false,
      },
      {
        id: 3,
        title: "Implement Passport.js strategy for GitHub",
        completed: false,
      },
    ],
  },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 p-2">
        <div className="flex flex-col space-y-4">
          <StatsCard />

          {/* Weekly Progress Section */}
          <div className="border border-gray-400/20 bg-white shadow-sm rounded-xl flex-1">
            <div className="flex p-3 items-center justify-between border-b border-b-gray-400/20">
              <div className="p-1">
                <h2 className="text-sm font-bold text-gray-900">
                  Weekly Progress
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5 mb-3">
                  Task completion trends across the current week
                </p>
              </div>
              <button className="bg-gray-400/10 hover:bg-gray-400/20 text-xs font-semibold rounded-md px-3 py-1.5">
                Current Week
              </button>
            </div>
            <div>
              <WeeklyProgressChart />
            </div>
          </div>

          {/* Tasks and Milestones Section */}
          <div className="flex py-6 flex-col md:flex-row md:gap-6 gap-3">
            {/* Recent Tasks */}
            <div className="border flex-1 p-3 border-gray-400/20 bg-white shadow-sm rounded-xl">
              <h3 className="p-2 text-sm  text-gray-900 font-bold">Recent Tasks</h3>
              <div className="w-full h-px bg-gray-300/20"></div>
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

            {/* Upcoming Milestones */}
            <div className="border flex-1 p-3 border-gray-400/20 bg-white shadow-sm rounded-xl">
              <h3 className="p-2 text-sm text-gray-900 font-bold">Upcoming Milestones</h3>
              <div className="w-full h-px bg-gray-300/20 mb-3"></div>
              <div className="text-xs text-gray-500 p-2">
                No upcoming milestones
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;