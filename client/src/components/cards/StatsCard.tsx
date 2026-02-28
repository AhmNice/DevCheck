import type { IconType } from "react-icons";
import { FaCalendar, FaMarker, FaSignal } from "react-icons/fa6";
import { FcParallelTasks } from "react-icons/fc";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  change?: String;
}

const statsData: StatsCardProps[] = [
  {
    title: "Total Tasks",
    value: 128,
    icon: FcParallelTasks,
    change: "from last week",
  },
  {
    title: "Completed",
    value: 84,
    icon: FaMarker,
    change: "of all tasks",
  },
  {
    title: "Overdue",
    value: 12,
    icon: FaSignal,
    change: "critical urgency",
  },
  {
    title: "Upcoming",
    value: 32,
    icon: FaCalendar,
    change: "for next 7 days",
  },
];

const StatsCard = () => {
  return (
    <div className="flex gap-4  justify-between">
      {statsData.map((stats) => {
        const { icon: Icon } = stats;
        return (
          <div className="p-6 border-2 flex-1 border-gray-400/20 bg-white rounded-xl">
            <div className="flex justify-between">
              <div>
                <h6 className="font-sans text-md text-blue-950/60 font-semibold">
                  {stats.title}
                </h6>
                <p className="font-bold text-4xl py-2">{stats.value}</p>
                <p className="text-sm text-blue-950/60">{stats.change}</p>
              </div>
              <div>
                <Icon />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCard;
