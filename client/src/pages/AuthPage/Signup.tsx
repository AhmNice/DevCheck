import { useState } from "react";
import { FaArrowRight, FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    // After successful signup, you might want to navigate to dashboard or login
    // navigate("/dashboard");
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
            Create an account
          </h1>
          <p className="text-sm text-gray-500">
            Start managing your technical tasks with focus
          </p>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200/60 text-left">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Full Name
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
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
                placeholder="Create a strong password"
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                required
              />
              <label htmlFor="terms" className="text-xs text-gray-500">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="bg-[#135bec] flex items-center gap-2 justify-center w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20"
            >
              Create Account <FaArrowRight size={14} />
            </button>

            <div className="relative py-2 flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button className="flex-1 w-full bg-white rounded-lg flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                <FaGithub size={18} /> GitHub
              </button>
              <button className="flex-1 w-full bg-white rounded-lg flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                <FcGoogle size={18} /> Google
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 py-6">
          <p className="text-xs text-gray-500">Already have an account?</p>
          <span
            className="text-xs text-blue-600 cursor-pointer font-medium hover:text-blue-700 hover:underline transition-all"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;