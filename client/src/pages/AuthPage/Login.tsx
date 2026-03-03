import { useState } from "react";
import Header from "../../components/LandingPageComponents/Header";
import { FaArrowRight, FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/dashboard");
    console.log(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="h-screen bg-[#f8f9fb]">
      <Header />
      <div className="flex items-center justify-center h-[90%]  max-w-full mx-auto">
        <div className="text-center">
          <div>
            <h1 className="text-[#0d121b] mb-2 text-4xl font-semibold xl:text-4xl">
              Log in to DevCheckList
            </h1>
            <p className="mb-4"> Manage your technical tasks with focus</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-gray-400/20 text-left">
            <form action="" className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="font-bold text-sm mb-1 text-black"
                >
                  Work Email
                </label>
                <input
                  className="border border-gray-400/20 outline-blue-400/10  rounded-md indent-2 p-2"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                />
              </div>
              <div className="flex flex-col pb-2">
                <label
                  htmlFor="password"
                  className="font-bold text-sm mb-1 text-black"
                >
                  Password
                </label>
                <input
                  className="border border-gray-400/10 outline-blue-400/10  rounded-md indent-2 p-2"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="bg-[#135bec] flex items-center gap-2 justify-center w-full py-3.5 px-4  rounded-lg text-white "
              >
                Sign In <FaArrowRight />
              </button>

              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-border-dark"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-border-dark"></div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button className="bg-white rounded-md flex items-center gap-2 py-2 px-12 border border-neutral-400/20">
                  <FaGithub /> GitHub
                </button>
                <button className="bg-white rounded-md flex items-center gap-2 py-2 px-12 border border-neutral-400/20">
                  <FcGoogle /> Google
                </button>
              </div>
            </form>
          </div>
          <div className="flex  items-center text-center justify-center gap-2 py-6">
            <p className="text-gray-400">Don't have an account?</p>
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Create an account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
