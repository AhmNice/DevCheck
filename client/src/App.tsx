import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
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
import Setting from "./pages/Setting";
import { Toaster } from "react-hot-toast";
import Protected from "./hooks/Protected";
import GuestRoute from "./hooks/GuestRoute";
import AuthSuccess from "./pages/AuthPage/AuthSuccess";

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
        <Route path="auth/success" element={<AuthSuccess/>}/>

        <Route
          path="dashboard"
          element={
            <Protected requiredRole={"user"}>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="task"
          element={
            <Protected>
              <Tasks />
            </Protected>
          }
        />
        <Route
          path="import"
          element={
            <Protected>
              <Import />
            </Protected>
          }
        />
        <Route
          path="analytics"
          element={
            <Protected>
              <Analytics />
            </Protected>
          }
        />
        <Route
          path="task/:title/:id"
          element={
            <Protected>
              <TaskDetials />
            </Protected>
          }
        />

        <Route
          path="setting"
          element={
            <Protected>
              <Setting />
            </Protected>
          }
        />
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
