import { useContext, useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  User as UserIcon,
  Mail,
  Lock,
  Compass
} from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { auth, googleProvider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";

// Google Icon Component
const GoogleIcon = () => (
  <svg
    className="w-5 h-5 mr-3 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Custom spring-animated theme toggle switch
const CustomThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase select-none">
        {isDark ? "Obsidian" : "Crisp Slate"}
      </span>
      <button
        type="button"
        onClick={toggleTheme}
        className="group relative w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300/30 dark:border-slate-700/50 shadow-inner flex items-center p-1 cursor-pointer transition-colors duration-500 focus:outline-none"
        aria-label="Toggle layout theme"
      >
        {/* Sliding thumb */}
        <div
          className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-lg relative z-10"
          style={{
            transform: isDark ? "translateX(32px)" : "translateX(0)",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Sun
              size={12}
              className={`absolute text-white transition-all duration-300 transform ${
                isDark ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
              }`}
            />
            <Moon
              size={12}
              className={`absolute text-white transition-all duration-300 transform ${
                isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
              }`}
            />
          </div>
        </div>

        {/* Fading background icons inside switch */}
        <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
          <Sun
            size={11}
            className={`text-amber-500 transition-opacity duration-300 ${
              isDark ? "opacity-35" : "opacity-0"
            }`}
          />
          <Moon
            size={11}
            className={`text-indigo-400 transition-opacity duration-300 ${
              isDark ? "opacity-0" : "opacity-35"
            }`}
          />
        </div>
      </button>
    </div>
  );
};

const Signup = () => {
  // Auth Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Interactive Milestone State
  const [activeMilestone, setActiveMilestone] = useState(3);
  const [isTimelineHovered, setIsTimelineHovered] = useState(false);

  // Auto-switch timeline milestones every 3 seconds unless hovered
  useEffect(() => {
    if (isTimelineHovered) return;
    const timer = setInterval(() => {
      setActiveMilestone((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, [isTimelineHovered]);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage("");
    try {
      localStorage.removeItem("token");
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post("/auth/google", { idToken });
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMessage("Sign-in popup closed before completion. Please try again.");
      } else {
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "Failed to authenticate with Google."
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Sign up Form Validator
  const validate = () => {
    const newErrors = {};
    if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = "Requires 8+ chars, 1 uppercase, 1 digit, 1 special char";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Email/Password Registration Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!validate()) return;
    setIsLoading(true);
    try {
      localStorage.removeItem("token");
      await api.post("/auth/signup", { name, email, password });
      const me = await api.get("/auth/me");
      setUser(me.data.user);
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorMessage("An account with this email already exists. Try logging in.");
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Signup failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Interactive Timeline Configuration
  const milestones = [
    {
      year: "Phase 1: Spark (2024)",
      title: "The Forge Genesis",
      description: "Conceived as an elite productivity companion designed to elevate routine consistency and task tracking.",
      icon: Sparkles,
    },
    {
      year: "Phase 2: Launch (2025)",
      title: "Pioneering Beta Engine",
      description: "Released to over 10,000 active beta builders, logging millions of automated task accomplishments.",
      icon: TrendingUp,
    },
    {
      year: "Phase 3: Insight (Early 2026)",
      title: "Elite Consistency Index",
      description: "Integrated gorgeous analytics, custom consistency charts, and robust historical database insights.",
      icon: Shield,
    },
    {
      year: "Phase 4: Frontier (Late 2026)",
      title: "AI-Powered Adaptive Habits",
      description: "Unlocking today: dynamic AI-guided routines, automated time blocks, and cooperative workflows. Join at the peak.",
      icon: CheckCircle2,
    },
  ];

  // Framer Motion staggered grid configurations
  const timelineContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const timelineItemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] transition-colors duration-500 overflow-x-hidden relative">
      
      {/* Blueprint Grid Aesthetic Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

      {/* Premium dynamic glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-sky-500/10 to-purple-500/10 blur-3xl opacity-60 pointer-events-none"></div>

      {/* Top Left Floating Logo */}
      <div className="absolute top-6 left-6 md:left-12 lg:left-20 z-40 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-md">
          <span className="text-white font-extrabold text-lg leading-none select-none">D</span>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent select-none">
          DailyForge
        </span>
      </div>

      {/* Absolute Float Header (Includes switch toggle) */}
      <header className="absolute top-6 right-6 z-40 flex items-center gap-4">
        <CustomThemeToggle />
      </header>

      {/* COLUMN A: Interactive Story & Website Timeline (Left) */}
      <section className="w-full md:w-[48%] lg:w-[45%] flex flex-col justify-center px-6 pt-24 pb-12 md:py-20 md:pl-12 lg:pl-20 relative z-10 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/60">
        <div className="max-w-md mx-auto md:mx-0 w-full space-y-8">
          
          {/* Logo & Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-500/8 dark:bg-indigo-500/15 border border-[#6366F1]/20 dark:border-[#6366F1]/30">
              <Compass className="w-4 h-4 text-[#6366F1] animate-spin-slow" />
              <span className="text-xs font-bold tracking-wider text-[#6366F1] uppercase">The DailyForge Story</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent leading-tight">
              Unlock Your Elite Consistency Core
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore our roadmap of evolution. Every step is engineered to turn chaos into compounding routines. Hover to highlight each epoch.
            </p>
          </div>

          {/* Interactive Visual Timeline */}
          <div 
            onMouseEnter={() => setIsTimelineHovered(true)}
            onMouseLeave={() => setIsTimelineHovered(false)}
            className="relative pl-3 space-y-6"
          >
            
            {/* Elegant Vertical Line with top/bottom fade */}
            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-transparent via-indigo-300 dark:via-indigo-900/60 to-transparent pointer-events-none"></div>

            <motion.div 
              variants={timelineContainerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {milestones.map((milestone, index) => {
                const MilestoneIcon = milestone.icon;
                const isActive = activeMilestone === index;
                const isCurrent = index === 3; // Latest milestone

                return (
                  <motion.div
                    key={index}
                    variants={timelineItemVariants}
                    onMouseEnter={() => setActiveMilestone(index)}
                    className="flex gap-5 items-start select-none"
                  >
                    
                    {/* Ring Node */}
                    <div className="relative flex items-center justify-center pt-1.5">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 z-10 relative cursor-pointer ${
                          isActive 
                            ? "bg-gradient-to-tr from-[#6366F1] to-[#4F46E5] border-[#6366F1] text-white shadow-lg shadow-indigo-500/25" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-indigo-500/50"
                        } ${isCurrent && !isActive ? "animate-pulse-ring" : ""}`}
                      >
                        <MilestoneIcon size={16} className={isActive ? "animate-pulse" : ""} />
                      </div>
                      
                      {/* Separate glowing active dot indicator behind */}
                      {isActive && (
                        <div className="absolute inset-0 w-10 h-10 bg-indigo-500/30 rounded-full blur-xs animate-ping"></div>
                      )}
                    </div>

                    {/* Timeline Content Card */}
                    <div 
                      className={`flex-1 p-5 rounded-2xl border transition-all duration-300 cursor-pointer transform ${
                        isActive 
                          ? "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 shadow-[0_10px_30px_rgba(99,102,241,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] translate-x-1.5" 
                          : "bg-transparent border-transparent opacity-65 hover:opacity-100"
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        isActive ? "text-[#6366F1]" : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {milestone.year}
                      </span>
                      <h3 className={`text-sm font-bold mt-0.5 transition-colors ${
                        isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                      }`}>
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* COLUMN B: High-Conversion Registration Form (Right) */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 md:py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.1 }}
          className="w-full max-w-md bg-white dark:bg-slate-900/80 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/80 p-8 sm:p-10 shadow-[0_20px_50px_rgba(99,102,241,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300"
        >
          {/* Header Title */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Forge Your Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign up today and unlock modern productivity engines
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Validation Server/Firebase Error */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-2xl text-xs font-semibold border bg-rose-500/10 border-rose-500/20 text-rose-500 leading-relaxed"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Full Name Input */}
            <div className="space-y-1.5 relative">
              <label 
                htmlFor="name" 
                className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase ml-1"
              >
                Full Name
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/80 group-focus-within:text-[#6366F1] transition-colors" />
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400/70 focus:placeholder-transparent outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900/40 focus:border-[#6366F1] focus:ring-[4px] focus:ring-[#6366F1]/15"
                />
              </div>
              {errors.name && (
                <span className="text-[11px] font-bold text-rose-500 ml-1">{errors.name}</span>
              )}
            </div>

            {/* Email Address Input */}
            <div className="space-y-1.5 relative">
              <label 
                htmlFor="email" 
                className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase ml-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/80 group-focus-within:text-[#6366F1] transition-colors" />
                <input
                  type="email"
                  id="email"
                  placeholder="e.g. builder@dailyforge.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400/70 focus:placeholder-transparent outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900/40 focus:border-[#6366F1] focus:ring-[4px] focus:ring-[#6366F1]/15"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 relative">
              <label 
                htmlFor="password" 
                className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase ml-1"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/80 group-focus-within:text-[#6366F1] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl text-sm bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400/70 focus:placeholder-transparent outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900/40 focus:border-[#6366F1] focus:ring-[4px] focus:ring-[#6366F1]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {errors.password ? (
                <span className="text-[11px] font-bold text-rose-500 ml-1 block leading-tight">{errors.password}</span>
              ) : (
                <p className="text-[10px] text-slate-400 ml-1">Requires 8+ characters, 1 uppercase, 1 digit, 1 special symbol</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5 relative">
              <label 
                htmlFor="confirmPassword" 
                className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase ml-1"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/80 group-focus-within:text-[#6366F1] transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl text-sm bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400/70 focus:placeholder-transparent outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900/40 focus:border-[#6366F1] focus:ring-[4px] focus:ring-[#6366F1]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                >
                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-[11px] font-bold text-rose-500 ml-1">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-4 py-3.5 px-4 rounded-2xl text-white font-medium bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#5A5DF0] hover:to-[#4338CA] shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] transition-all duration-300 transform hover:-translate-y-[1.5px] active:scale-[0.98] active:translate-y-0 cursor-pointer disabled:opacity-50 flex items-center justify-center text-sm"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Forging Account...
                </>
              ) : (
                <>
                  Get Started Free
                  <ArrowRight size={16} className="ml-2 animate-pulse" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-5 py-1">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              <span className="px-4 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">
                OR
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="flex items-center justify-center w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-100 text-sm font-semibold transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:-translate-y-[1px] hover:shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isGoogleLoading ? <LoadingSpinner /> : <GoogleIcon />}
              {isGoogleLoading ? "Connecting OAuth..." : "Continue with Google"}
            </button>

            {/* Form Footer */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 pt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#6366F1] font-bold hover:underline ml-1 hover:text-[#4F46E5] transition-colors"
              >
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default Signup;