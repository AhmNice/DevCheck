import { Calendar, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { subTask } from "../data/subtaskData";

export interface taskProps {
  tag: string;
  id?: number;
  title: string;

  description?: string;
  percentage?: number;
  startDate: string;
  endDate: string;
  subtaskData?: subTask[];
}

export const MiniTaskCard = ({ title, startDate, endDate }: taskProps) => {
  return (
    <div>
      <div className="flex items-center px-6 justify-between">
        <div className="flex items-center gap-6 py-4">
          <div className="rounded-full w-4 h-4 bg-blue-500"></div>
          <div>
            <h2 className=" text-gray-700 font-semibold">{title}</h2>
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex text-sm items-center gap-2">
                <Calendar size={16} /> <span>{startDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} /> <span>{endDate}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <ChevronRight size={20} className="text-gray-600" />
        </div>
      </div>
      <div className="w-full  h-0.5 bg-gray-300/20"></div>
    </div>
  );
};

const TaskCard = ({
  tag,
  title,
  description,
  percentage,
  startDate,
  endDate,
  subtaskData,
}: taskProps) => {
  console.log(subtaskData);
  const navigate = useNavigate();
  let tagStyle = "";

  if (tag.includes("HIGH")) {
    tagStyle = "bg-red-100 text-red-600";
  } else if (tag.includes("MEDIUM")) {
    tagStyle = "bg-orange-100 text-orange-600";
  } else if (tag.includes("LOW")) {
    tagStyle = "bg-green-100 text-green-600";
  }

  return (
    <div className="bg-white border border-gray-400/20 shadow-sm  rounded-2xl p-6">
      <span className={`text-sm px-4 py-1 rounded-lg font-bold ${tagStyle}`}>
        {tag}
      </span>

      <h2 className="pt-5 font-bold text-lg pb-3">{title}</h2>
      <p className=" text-gray-400  mt-0.5 mb-5">{description}</p>

      <div className="mb-4">
        <div className="flex justify-between">
          <p className="text-gray-500 text-sm">Progress</p>
          <p className="font-bold">{percentage}%</p>
        </div>
        <div className="w-full h-2 bg-primary-700/20 rounded-full">
          <div
            style={{ width: `${percentage}%` }}
            className="bg-primary rounded-full h-2 transition-all duration-300"
          ></div>
        </div>
      </div>

      <div className="w-full  h-0.5 bg-gray-300/20"></div>
      <div className="flex mt-4 items-center justify-between text-gray-500">
        <div className="flex items-center gap-6 ">
          <div className="flex items-center gap-2">
            <Calendar size={16} /> <span>{startDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} /> <span>{endDate}</span>
          </div>
        </div>
        <div
          onClick={() =>
            navigate("/task-details", {
              state: {
                tag,
                title,
                description,
                percentage,
                startDate,
                endDate,
                subtaskData,
              },
            })
          }
          className="cursor-pointer"
        >
          <ExternalLink size={16} />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
