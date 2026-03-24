const Cta = () => {
  return (
    <div className="px-4 md:px-20 lg:px-40 flex flex-none justify-center py-16 bg-gray-50">
      <div className="flex flex-col max-w-[1200px] flex-1">
        <div className="bg-[#135bec] rounded-2xl p-8 md:p-16 flex flex-col items-center text-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-[150px]">
              terminal
            </span>
          </div>
          <div className="flex flex-col gap-3 z-10">
            <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight max-w-[720px]">
              Ready to streamline your sprint?
            </h2>
            <p className="text-white/80 text-base md:text-lg font-normal leading-normal max-w-[600px] mx-auto">
              Join 10,000+ developers managing high-stakes tasks with DevCheck.
            </p>
          </div>
          <div className="flex justify-center z-10">
            <button className="flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-white text-[#135bec] text-base font-semibold shadow-2xl transition-transform hover:scale-105">
              <span className="truncate">Get Started Free</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cta;
