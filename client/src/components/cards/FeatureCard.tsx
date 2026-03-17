interface FeatureCardProps {
  title: string;
  description: string;
  icon?: string;
}

const FeatureCard = ({ title, description, icon = "Code" }: FeatureCardProps) => {
  return (
    <div className="h-full">
      <div className="flex flex-1 gap-3 bg-white rounded-xl border border-gray-200 p-5 flex-col hover:border-blue-500/50 hover:shadow-md transition-all duration-300">
        <div className="text-blue-600 bg-blue-50 size-9 flex items-center justify-center rounded-lg">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-gray-900 text-base font-semibold leading-snug">
            {title}
          </h3>
          <p className="text-gray-600 text-sm font-normal leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;