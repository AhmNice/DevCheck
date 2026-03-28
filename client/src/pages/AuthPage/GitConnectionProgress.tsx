import {
  Check,
  Loader2,
  Lock,
  ArrowRight,
  //   Shield,
  //   Key,
  //   Zap,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

type StepStatus = "done" | "loading" | "pending";

interface Step {
  status: StepStatus;
  title: string;
  subtitle: string;
  isLast?: boolean;
}

const steps: Step[] = [
  {
    status: "done",
    title: "Authenticating with GitHub",
    subtitle: "Secure OAuth handshake successful",
  },
  {
    status: "loading",
    title: "Verifying permissions",
    subtitle: "Checking repository access scopes...",
  },
  {
    status: "pending",
    title: "Establishing secure connection",
    subtitle: "Waiting for verification...",
    isLast: true,
  },
];

// const badges = [
//   { icon: Shield, label: "256-bit Encryption", sub: "End-to-end secure" },
//   { icon: Key, label: "Read-only Access", sub: "Safe repository links" },
//   { icon: Zap, label: "Real-time Sync", sub: "Instant checklist updates" },
// ];

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <div className="size-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-300">
        <Check className="w-4 h-4 stroke-[2.5]" />
      </div>
    );
  }
  if (status === "loading") {
    return (
      <div className="size-8 rounded-full bg-[#3211d4]/10 text-[#3211d4] flex items-center justify-center border border-[#3211d4]/40">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }
  return (
    <div className="size-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
      <Lock className="w-4 h-4" />
    </div>
  );
}

const GitHubConnectionProgress = () => {
  const navigate = useNavigate();
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] font-sans text-slate-900">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-6">
            <h1 className="text-[#0d121b] leading-tight tracking-tight mb-2 text-2xl md:text-3xl font-bold">
              GitHub Connection Progress
            </h1>
            <p className="text-sm text-gray-500">
              Securely connecting your development workflow to your repositories
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
              <div className="h-full bg-primary/50" style={{ width: "65%" }} />
            </div>

            <div className="flex flex-col items-center mb-10">
              <div className="relative mb-4">
                <div className="flex justify-center  w-full">
                  <span className="p-8 rounded-full border-2 border-gray-200 bg-gray-100">
                    <FaGithub className="fill-gray-600" size={50} />
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-blue-700 flex items-center justify-center animate-pulse border-4 border-white">
                  <Loader2 className="w-4 h-4 text-white spin-slow" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Connecting...
              </h3>
              <p className="text-slate-500 mt-2">
                Please wait while we sync with your GitHub account
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {steps.map((step) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <StepIcon status={step.status} />
                    {!step.isLast && (
                      <div
                        className={`w-px h-10 mt-1 ${
                          step.status === "done"
                            ? "bg-emerald-300"
                            : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pt-1">
                    <p
                      className={`font-semibold ${
                        step.status === "pending"
                          ? "text-slate-400"
                          : "text-slate-900"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-sm ${
                        step.status === "done"
                          ? "text-emerald-600"
                          : step.status === "loading"
                            ? "text-[#3211d4] font-medium"
                            : "text-slate-400 italic"
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                <span>Continue Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/connectionFailed")}
                className="px-6 py-3 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {badges.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm"
              >
                <Icon className="w-5 h-5 text-[#4f46e5] flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">{label}</p>
                  <p className="text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default GitHubConnectionProgress;
