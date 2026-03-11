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
      <div className="flex-1 md:p-6 p-2 ">
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
          <div className="flex py-8 flex-col md:flex-row md:gap-8 gap-4">
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
