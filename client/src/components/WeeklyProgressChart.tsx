import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface dataProps {
  day: string;
  tasks: number;
}

const data: dataProps[] = [
  { day: "Mon", tasks: 30 },
  { day: "Tue", tasks: 72 },
  { day: "Wed", tasks: 45 },
  { day: "Thu", tasks: 68 },
  { day: "Fri", tasks: 55 },
  { day: "Sat", tasks: 95 },
  { day: "Sun", tasks: 84 },
];

export default function WeeklyProgressChart() {
  return (
    <div className="bg-white flex-1 rounded-2xl p-7 w-full">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-black text-gray-900">84</span>
        <span className="text-sm font-semibold text-emerald-500">↗ +12%</span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
        >
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            domain={[0, 110]}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="tasks"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#grad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
