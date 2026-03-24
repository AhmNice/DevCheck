const Footer = () => {
  return (
    <footer className="px-4 md:px-20 lg:px-40 flex flex-none justify-center py-10 border-t border-gray-200">
      <div className="flex flex-col max-w-[1200px] flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-6 bg-gray-400 rounded flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">
                checklist
              </span>
            </div>
            <span className="text-[#0d121b] font-semibold text-sm">
              DevCheck
            </span>
            <span className="text-[#4c669a] text-xs ml-2">
              © 2024 DevCheck Inc.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              className="text-[#4c669a] text-xs font-medium hover:text-primary transition-colors flex items-center gap-1.5"
              href="#"
            >
              <span className="material-symbols-outlined text-base">
                description
              </span>
              Docs
            </a>
            <a
              className="text-[#4c669a] text-xs font-medium hover:text-primary transition-colors flex items-center gap-1.5"
              href="#"
            >
              <span className="material-symbols-outlined text-base">
                terminal
              </span>
              GitHub
            </a>
            <a
              className="text-[#4c669a] text-xs font-medium hover:text-primary transition-colors flex items-center gap-1.5"
              href="#"
            >
              <span className="material-symbols-outlined text-base">
                shield
              </span>
              Privacy
            </a>
          </div>
          <div className="flex gap-3">
            <button className="p-1.5 rounded-lg bg-gray-100 text-[#4c669a] hover:text-primary">
              <span className="material-symbols-outlined text-lg">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
