import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import Toast from "./components/CustomToast";
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
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import Protected from "./hooks/Protected";
import GuestRoute from "./hooks/GuestRoute";
import AuthSuccess from "./pages/AuthPage/AuthSuccess";
import ConnectionFailed from "./pages/AuthPage/ConnectionFailed";
import GitConnectionProgress from "./pages/AuthPage/GitConnectionProgress";
import Settings from "./pages/Settings";
import GithubConnection from "./pages/GithubConnection";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="*" element={<PageNotFound />} />
        <Route
          path="auth/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="auth/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route path="auth/success" element={<AuthSuccess />} />

        <Route
          path="dashboard"
          element={
            <Protected requiredRole={"USER"}>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="task"
          element={
            <Protected requiredRole={"USER"}>
              <Tasks />
            </Protected>
          }
        />
        <Route
          path="import"
          element={
            <Protected requiredRole={"USER"}>
              <Import />
            </Protected>
          }
        />
        <Route
          path="analytics"
          element={
            <Protected requiredRole={"USER"}>
              <Analytics />
            </Protected>
          }
        />
        <Route
          path="task/:title/:id"
          element={
            <Protected requiredRole={"USER"}>
              <TaskDetials />
            </Protected>
          }
        />

        <Route
          path="profile"
          element={
            <Protected requiredRole={"USER"}>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="settings"
          element={
            <Protected requiredRole={"USER"}>
              <Settings />
            </Protected>
          }
        />
        <Route
          path="settings/connect/github"
          element={
            <Protected requiredRole={"USER"}>
              <GithubConnection />
            </Protected>
          }
        />
        <Route
          path="auth/git-connection-progress"
          element={<GitConnectionProgress />}
        />
        <Route path="auth/connection-failed" element={<ConnectionFailed />} />
      </Route>,
    ),
  );
  return (
    <>
      <RouterProvider router={router} />

      <Toaster position="top-right">{(t) => <Toast t={t} />}</Toaster>
    </>
  );
}
export default App;
