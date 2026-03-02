const Cta = () => {
  return (
    <div>
      <div className="px-4 md:px-20 lg:px-40 flex flex-none justify-center py-20 bg-gray-50 ">
        <div className="flex flex-col max-w-[1200px] flex-1">
          <div className="bg-[#135bec] rounded-3xl p-10 md:p-20 flex flex-col items-center text-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <span className="material-symbols-outlined text-[200px]">
                terminal
              </span>
            </div>
            <div className="flex flex-col gap-4 z-10">
              <h2 className="text-white text-4xl md:text-5xl font-black leading-tight max-w-[720px]">
                Ready to streamline your sprint?
              </h2>
              <p className="text-white/80 text-lg md:text-xl font-normal leading-normal max-w-[600px] mx-auto">
                Join 10,000+ developers managing high-stakes tasks with
                DevChecklist.
              </p>
            </div>
            <div className="flex justify-center z-10">
              <button className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-white text-[#135bec]  text-lg font-bold shadow-2xl transition-transform hover:scale-105">
                <span className="truncate">Get Started Free</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cta;
