const Hero = () => {
  return (
    <div className="lg:py-30 py-25 px-4 md:px-20 lg:px-40">
      <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto items-center gap-10 flex-1">
        <div className="flex flex-col gap-6 flex-1">
          <div className="flex flex-col gap-3 text-left">
            <h1 className="text-[#0d121b] text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-[-0.033em]">
              Manage Dev Tasks Without Missing a Deadline
            </h1>
            <p className="text-[#4c669a] text-base md:text-lg font-normal leading-relaxed max-w-[540px]">
              The distraction-free checklist tool built specifically for
              engineers and designers. Simple, portable, and lightning fast.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex min-w-[150px] cursor-pointer items-center justify-center rounded-lg h-11 px-6 bg-[#135bec] text-white text-sm font-medium shadow-lg shadow-primary/20 hover:bg-blue-700/90 transition-all">
              <span>Get Started Free</span>
            </button>
            <button className="flex min-w-[150px] cursor-pointer items-center justify-center rounded-lg h-11 px-6 bg-white border border-gray-200 text-[#0d121b] text-sm font-medium hover:bg-gray-50 transition-all">
              <span>View Demo</span>
            </button>
          </div>
        </div>
        <div className="flex-1">
          <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 aspect-square md:aspect-video rounded-xl border border-primary/20 flex items-center justify-center p-3 relative overflow-hidden group">
            <div className="w-full h-full bg-white rounded-lg shadow-xl p-4 flex flex-col gap-3 border border-gray-100">
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse"></div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg">
                    <div className="size-4 rounded border-2 border-primary bg-blue-700/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xs font-bold">
                        check
                      </span>
                    </div>
                    <div className="h-3 w-40 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5">
                    <div className="size-4 rounded border-2 border-gray-300"></div>
                    <div className="h-3 w-28 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5">
                    <div className="size-4 rounded border-2 border-gray-300"></div>
                    <div className="h-3 w-48 bg-gray-200 rounded"></div>
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