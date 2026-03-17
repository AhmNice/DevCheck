import type { IconType } from "react-icons";
import { ListTodo, Calendar, CheckCircle, AlertCircle } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  percentage: number | string;
  change?: string;
}

const statsData: StatsCardProps[] = [
  {
    title: "Total Tasks",
    value: 128,
    icon: ListTodo,
    percentage: "+5",
    change: "from last week",
  },
  {
    title: "Completed",
    value: 84,
    icon: CheckCircle,
    percentage: "+12",
    change: "of all tasks",
  },
  {
    title: "Overdue",
    value: 12,
    icon: AlertCircle,
    percentage: "-2",
    change: "critical urgency",
  },
  {
    title: "Upcoming",
    value: 32,
    icon: Calendar,
    percentage: "+8",
    change: "for next 7 days",
  },
];

const StatsCard = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 justify-between">
      {statsData.map((stats, index) => {
        let tagStyle;
        if (stats.percentage.toString().includes("+")) {
          tagStyle = "bg-green-100 text-green-600";
        } else if (stats.percentage.toString().includes("-")) {
          tagStyle = "bg-red-100 text-red-600";
        }
        const { icon: Icon } = stats;
        return (
          <div key={index} className="p-4 flex-1 shadow-sm bg-white rounded-xl">
            <div className="flex justify-between">
              <div className="space-y-2">
                <h6 className="font-sans text-xs text-blue-950/60 font-semibold uppercase tracking-wide">
                  {stats.title}
                </h6>
                <p className="font-bold text-2xl">{stats.value}</p>
                <p className="text-xs text-blue-950/60 flex items-center flex-wrap gap-1">
                  <span className={`${tagStyle} px-1.5 py-0.5 rounded-md text-xs font-medium`}>
                    {stats.percentage}%
                  </span>
                  <span className="text-gray-500">{stats.change}</span>
                </p>
              </div>
              <div>
                <Icon size={14} className="text-gray-400" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCard;