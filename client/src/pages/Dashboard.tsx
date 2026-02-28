import StatsCard from "../components/cards/StatsCard";
import DashboardLayout from "../Layout/DashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 p-8 ">
        <div>
          <StatsCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
