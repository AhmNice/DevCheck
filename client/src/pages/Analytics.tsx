import { Lightbulb, LightbulbIcon } from "lucide-react";
import WeeklyProgressChart, {
  TaskBarChart,
  TaskPieChart,
} from "../components/WeeklyProgressChart";
import DashboardLayout from "../Layout/DashboardLayout";
import { MiniTaskCard } from "../components/cards/TaskCard";
import { taskData } from "./Tasks";
import StatsCard from "../components/cards/StatsCard";

const pieData = [
  { name: "Completed", value: 8 },
  { name: "In Progress", value: 5 },
  { name: "Review", value: 3 },
  { name: "Overdue", value: 2 },
];

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <StatsCard />
        <div className="flex items-center gap-6">
          <div className="flex-1 shadow-sm rounded-2xl overflow-hidden">
            <TaskBarChart data={pieData} />
          </div>
          <TaskPieChart data={pieData} />
        </div>
        <div>
          <div className="flex gap-8">
            <div className="rounded-lg w-[30%] py-8 space-y-2 flex flex-col text-blue-100 p-4 bg-blue-600 ">
              <div className="p-2  self-start text-white bg-blue-300 rounded-lg">
                <Lightbulb />
              </div>
              <h3 className="font-bold text-white text-xl">Weekly Insight</h3>
              <p>
                You are most productive on <strong>Tuesday</strong>
                <strong>mornings</strong> between 9:00 AM and 11:30 AM. You
                complete 34% more tasks during this window than any other time.
              </p>
              <button className="rounded-lg mt-8 cursor-pointer px-4 justify-start  self-start font-bold py-3 hover:bg-blue-800  hover:scale-105 bg-white text-blue-500 transition-all delay-150 duration-150">
                View Productivity Map
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-8 flex-2">
              <div className="border flex-1 p-4 border-gray-400/20 bg-white shadow-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <h3 className="p-3 font-bold">High Impact Tasks</h3>
                  <button className="text-blue-500">View All</button>
                </div>
                <div className="w-full  h-0.5 bg-gray-300/20"></div>
                {/* <table>
                  <thead>
                    <th>
                      <tr>Task Name</tr>
                      <tr>Category</tr>
                      <tr>Start Time</tr>
                      <tr>Due Time</tr>
                      <tr>Status</tr>
                    </th>
                  </thead>
                </table> */}
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
