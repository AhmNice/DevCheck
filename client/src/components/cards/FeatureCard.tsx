interface FeatureCardProps {
  title: string;
  description: string;
}
const FeatureCard = ({ title, description }: FeatureCardProps) => {
  return (
    <div>
      <div className="flex flex-1 gap-5 bg-white rounded-2xl border border-gray-200 bg-whit p-8 flex-col hover:border-[#135bec]/50 transition-colors shadow-sm">
        <div className="text-primary bg-[#135bec]/10 size-12 flex items-center justify-center rounded-xl">
          <span className="material-symbols-outlined text-3xl">Code</span>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-[#0d121b] text-xl font-bold leading-tight">
            {title}
          </h3>
          <p className="text-[#4c669a] text-base font-normal leading-normal">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
