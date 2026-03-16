const Hero = () => {
  return (
    <div className="lg:py-30 py-25 ">
      <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto items-center gap-10 flex-1">
        <div className="flex flex-col gap-8 flex-1">
          <div className="flex flex-col gap-4 text-left">
            <h1 className="text-[#0d121b]  text-4xl font-black xl:text-7xl leading-tight tracking-[-0.033em] @[480px]:text-8xl">
              Manage Dev Tasks Without Missing a Deadline
            </h1>
            <h2 className="text-[#4c669a] lg:text-xl  text-lg font-normal leading-relaxed max-w-[540px]">
              The distraction-free checklist tool built specifically for
              engineers and designers. Simple, portable, and lightning fast.
            </h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-14 px-6 bg-[#135bec] text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-blue-700/90">
              <span>Get Started Free</span>
            </button>
            <button className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-14 px-6 bg-white  border border-gray-200  text-[#0d121b]  text-base font-bold hover:bg-gray-50 ">
              <span>View Demo</span>
            </button>
          </div>
        </div>
        <div className="flex-1">
          <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent aspect-square md:aspect-video rounded-2xl border border-primary/20 flex items-center justify-center p-4 relative overflow-hidden group">
            <div className="w-full h-full bg-white  rounded-xl shadow-2xl p-6 flex flex-col gap-4 border border-gray-100 dark:border-gray-800">
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-3">
                <div className="h-8 w-3/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="size-5 rounded border-2 border-primary bg-blue-700/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[16px] font-bold">
                        check
                      </span>
                    </div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <div className="size-5 rounded border-2 border-gray-300 dark:border-gray-600"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <div className="size-5 rounded border-2 border-gray-300 dark:border-gray-600"></div>
                    <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-blue-700/5 group-hover:bg-transparent transition-colors pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
