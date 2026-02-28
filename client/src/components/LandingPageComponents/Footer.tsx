const Footer = () => {
  return (
    <div>
      <footer className="px-4 md:px-20 lg:px-40 flex flex-none justify-center py-12 border-t border-gray-200 ">
        <div className=" flex flex-col max-w-[1200px] flex-1">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-6 bg-gray-400 rounded flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-sm">
                  checklist
                </span>
              </div>
              <span className="text-[#0d121b] dark:text-white font-bold">
                DevChecklist
              </span>
              <span className="text-[#4c669a] dark:text-gray-500 text-sm ml-4">
                © 2024 DevChecklist Inc.
              </span>
            </div>
            <div className="flex items-center gap-10">
              <a
                className="text-[#4c669a] dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
                href="#"
              >
                <span className="material-symbols-outlined text-lg">
                  description
                </span>{" "}
                Docs
              </a>
              <a
                className="text-[#4c669a] dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
                href="#"
              >
                <span className="material-symbols-outlined text-lg">
                  terminal
                </span>{" "}
                GitHub
              </a>
              <a
                className="text-[#4c669a] dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
                href="#"
              >
                <span className="material-symbols-outlined text-lg">
                  shield
                </span>{" "}
                Privacy
              </a>
            </div>
            <div className="flex gap-4">
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-[#4c669a] dark:text-gray-400 hover:text-primary">
                <span className="material-symbols-outlined">dark_mode</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;

// onClick={`document.documentElement.classNameList.toggle('dark')`}
