import { useState } from "react";
import { FaArrowRight, FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/dashboard", { state: { formData } });
    console.log(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-[#0d121b] mb-2 text-2xl md:text-3xl font-bold">
            Log in to DevCheck
          </h1>
          <p className="text-sm text-gray-500">
            Manage your technical tasks with focus
          </p>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200/60 text-left">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Work Email
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Password
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="bg-[#135bec] flex items-center gap-2 justify-center w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20"
            >
              Sign In <FaArrowRight size={14} />
            </button>

            <div className="relative py-2 flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div
                onClick={() => navigate("/gitConnection")}
                className="flex-1 w-full bg-white rounded-lg flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <FaGithub size={18} /> GitHub
              </div>
              <button className="flex-1 w-full bg-white rounded-lg flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                <FcGoogle size={18} /> Google
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 py-6">
          <p className="text-xs text-gray-500">Don't have an account?</p>
          <span
            className="text-xs text-blue-600 cursor-pointer font-medium hover:text-blue-700 hover:underline transition-all"
            onClick={() => navigate("/signup")}
          >
            Create an account
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
