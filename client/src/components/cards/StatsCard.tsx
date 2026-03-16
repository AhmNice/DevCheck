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
    <div className="grid grid-cols-2 md:grid-cols-4  gap-4  justify-between">
      {statsData.map((stats) => {
        let tagStyle;
        if (stats.percentage.toString().includes("+")) {
          tagStyle = "bg-green-100 text-green-600";
        } else if (stats.percentage.toString().includes("-")) {
          tagStyle = "bg-red-100 text-red-600";
        }
        const { icon: Icon } = stats;
        return (
          <div className="p-6 flex-1 shadow-sm bg-white rounded-xl">
            <div className="flex justify-between">
              <div className="space-y-3">
                <h6 className="font-sans text-md text-blue-950/60 font-semibold">
                  {stats.title}
                </h6>
                <p className="font-bold text-4xl py-2">{stats.value}</p>
                <p className="text-sm text-blue-950/60">
                  <span className={`${tagStyle} px-2 py-1 rounded-md mr-3`}>
                    {stats.percentage}%
                  </span>
                  {stats.change}
                </p>
              </div>
              <div>
                <Icon size={16} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCard;
