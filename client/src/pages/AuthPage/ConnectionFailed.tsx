import { FaCircleArrowDown, FaLink } from "react-icons/fa6";

const ConnectionFailed = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white text-center space-y-6 p-6 shadow-lg rounded-xl border border-gray-200/60 ">
          <div className="flex justify-center  w-full">
            <span className="p-8 rounded-full border-2 border-gray-200 bg-gray-100">
              <FaLink className="fill-gray-600" size={50} />
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex text-center items-center flex-col space-y-1.5">
              <h1 className="text-[#0d121b] mb-2 text-2xl md:text-3xl font-bold">
                Connection Failed
              </h1>
              <p className="text-sm text-gray-500">
                We couldn't connect to your GitHub account. This usually happens
                due to denied permissions, an expired session, or a network
                interruption.
              </p>
            </div>

            <button
              type="submit"
              className="bg-[#135bec] flex items-center gap-2 justify-center w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20"
            >
              Try again <FaCircleArrowDown size={14} />
            </button>
            <button className="flex-1 w-full bg-white rounded-lg flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
              Back to Settings
            </button>
          </form>

          <div className="flex-grow border-t border-gray-200"></div>

          <div></div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionFailed;
