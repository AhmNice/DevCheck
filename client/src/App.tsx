import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Layout from "./Layout/Layout";
import Login from "./pages/AuthPage/Login";
import Signup from "./pages/AuthPage/Signup";
import Dashboard from "./pages/Dashboard";
import PageNotFound from "./pages/PageNotFound";
import Tasks from "./pages/Tasks";
import Import from "./pages/Import";
import Analytics from "./pages/Analytics";
import { TaskDetials } from "./pages/TaskDetials";
import CreateTask from "./pages/CreateTask";
import Setting from "./pages/Setting";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="task" element={<Tasks />} />
        <Route path="import" element={<Import />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="task/:title/:id" element={<TaskDetials />} />
        <Route path="task-create" element={<CreateTask />} />
        <Route path="setting" element={<Setting />} />
      </Route>,
    ),
  );
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
export default App;
