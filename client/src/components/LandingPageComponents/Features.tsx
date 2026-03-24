import FeatureCard from "../cards/FeatureCard";

const Features = () => {
  return (
    <section className="px-4 md:px-20 lg:px-40 py-16 md:py-20">
      <div className="flex flex-col max-w-[1200px] mx-auto flex-1">
        <div className="flex flex-col gap-3 px-4 pt-12 pb-6 text-center items-center">
          <span className="text-[#135bec] font-semibold tracking-widest text-xs uppercase bg-[#135bec]/10 px-3 py-1 rounded-full">
            Features
          </span>
          <h2 className="text-[#0d121b] text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-[-0.015em]">
            Built for your technical workflow
          </h2>
          <p className="text-[#4c669a] text-base md:text-lg max-w-[720px]">
            Focus on shipping code, not fighting your task manager. Every
            feature is optimized for technical teams.
          </p>
        </div>

        <div className="flex flex-none justify-center pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4">
            <FeatureCard
              title="JSON Import/Export"
              description="Your data, your way. Export checklists to JSON for version control, CI/CD pipes, or automated documentation."
            />
            <FeatureCard
              title="Progress Tracking"
              description="Visual metrics that help you stay on schedule without the clutter. High-level charts for sprint velocity."
            />
            <FeatureCard
              title="Smart Notifications"
              description="Integrated alerts that push to Slack or Discord. Keep your team synced and deadlines met effortlessly."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;