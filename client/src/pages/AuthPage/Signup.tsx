import { useState } from "react";
import { FaArrowRight, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { LuLoaderCircle } from "react-icons/lu";
import toast from "react-hot-toast";
import { notify } from "../../util/notify";

const API_URL = import.meta.env.VITE_SERVER_URL;

interface FormErrors {
  name: string;
  email: string;
  password: string;
  terms: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({
    github: false,
    google: false,
  });
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    password: "",
    terms: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: "",
      email: "",
      password: "",
      terms: "",
    };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
      isValid = false;
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
      isValid = false;
    }

    // Validate terms
    if (!termsAccepted) {
      newErrors.terms = "You must agree to the terms and conditions";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Replace with your actual API call
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed. Please try again.");
      }

      toast.success("Account created successfully!");
      toast.success("Please log in to continue");

      // Navigate to login after successful signup
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignup = () => {
  if (oauthLoading.github) return;
  setOauthLoading((prev) => ({ ...prev, github: true }));

  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  // Open the OAuth popup
  const authWindow = window.open(
    `${API_URL}/auth/github-auth`,
    "GitHub Login",
    `width=${width},height=${height},top=${top},left=${left}`
  );

  if (!authWindow) {
    console.error("Failed to open popup");
    setOauthLoading((prev) => ({ ...prev, github: false }));
    return;
  }

  // Cleanup function
  const cleanup = () => {
    setOauthLoading((prev) => ({ ...prev, github: false }));
    clearInterval(popupCheckInterval);
    window.removeEventListener("message", handleMessage);
  };

  // Listen for messages from the popup
  const handleMessage = (event: MessageEvent) => {
    // Must match the origin of your app
    if (event.origin !== window.location.origin) return;

    const { success, token, userId } = event.data;
    console.log("Message from popup:", event.data);

    if (success) {
      // Show success notification
      notify.success("Signed up with GitHub successfully!");
      // Redirect SPA after signup
      window.location.href = "/dashboard";
    }

    cleanup();
  };

  window.addEventListener("message", handleMessage);

  // Check if popup was manually closed
  const popupCheckInterval = setInterval(() => {
    if (authWindow.closed) {
      console.log("Popup closed by user");
      cleanup();
    }
  }, 500);
};


  const handleGoogleSignup = async () => {
    if (oauthLoading.google) return;

    setOauthLoading((prev) => ({ ...prev, google: true }));
    try {
      window.location.href = `${API_URL}/auth/google-auth`;
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Failed to connect to Google");
      setOauthLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
    if (errors.terms) {
      setErrors((prev) => ({ ...prev, terms: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-[#0d121b] mb-2 text-2xl md:text-3xl font-bold">
            Create an account
          </h1>
          <p className="text-sm text-gray-500">
            Start managing your technical tasks with focus
          </p>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-200/60 text-left">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Full Name
              </label>
              <input
                id="name"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200"
                }`}
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Work Email
              </label>
              <input
                id="email"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200"
                }`}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200"
                  }`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-7 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              ) : (
                <p className="text-[10px] text-gray-400 mt-1">
                  Must be at least 8 characters with 1 uppercase and 1 number
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className={`mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20 ${
                  errors.terms ? "border-red-300" : ""
                }`}
                checked={termsAccepted}
                onChange={handleTermsChange}
                disabled={loading}
              />
              <label htmlFor="terms" className="text-xs text-gray-500">
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-xs -mt-3">{errors.terms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#135bec] flex items-center gap-2 justify-center w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="flex gap-3 items-center justify-center">
                  <LuLoaderCircle
                    className="animate-spin font-bold"
                    size={14}
                  />
                  <span>Creating account...</span>
                </div>
              ) : (
                <>
                  Create Account <FaArrowRight size={14} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-2 flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* OAuth Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGitHubSignup}
                disabled={oauthLoading.github}
                className="flex-1 w-full bg-white rounded-lg flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading.github ? (
                  <LuLoaderCircle className="animate-spin" size={18} />
                ) : (
                  <FaGithub size={18} />
                )}
                GitHub
              </button>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={oauthLoading.google}
                className="flex-1 w-full bg-white rounded-lg flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading.google ? (
                  <LuLoaderCircle className="animate-spin" size={18} />
                ) : (
                  <FcGoogle size={18} />
                )}
                Google
              </button>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="flex items-center justify-center gap-2 py-6">
          <p className="text-xs text-gray-500">Already have an account?</p>
          <button
            type="button"
            className="text-xs text-blue-600 cursor-pointer font-medium hover:text-blue-700 hover:underline transition-all"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
