import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGamification } from "../context/GamificationContext";
import Quiz from "../components/Quiz";
import Footer from "../components/Footer";

const Home = () => {
  const [backendStatus, setBackendStatus] = useState("");
  const { completedQuizzes } = useGamification();
  const [showChallenge, setShowChallenge] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isMonday, setIsMonday] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [statusLabel, setStatusLabel] = useState("");

  // Backend connection check
  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status))
      .catch(() => setBackendStatus("Backend not connected ❌"));
  }, []);

  // Live ticking challenge window scheduler (available ONLY on Monday, closes Monday midnight)
  useEffect(() => {
    const updateChallengeState = () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); 
      const active = dayOfWeek === 1;
      setIsMonday(active);

      if (active) {
        // Monday! Challenge is ACTIVE. Count down to end of Monday (Tuesday 00:00:00)
        const endOfMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        endOfMonday.setHours(0, 0, 0, 0);

        const diff = endOfMonday.getTime() - now.getTime();
        if (diff <= 0) {
          setTimeLeft("00h 00m 00s");
          setStatusLabel("Challenge closed!");
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
        setStatusLabel("Challenge closes tonight!");
      } else {
        const nextMonday = new Date();
        nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
        nextMonday.setHours(0, 0, 0, 0);

        const diff = nextMonday.getTime() - now.getTime();
        if (diff <= 0) {
          setTimeLeft("Drops today!");
          setStatusLabel("Next challenge is here!");
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        
        if (days === 0) {
          setStatusLabel("Next challenge drops tomorrow!");
        } else {
          setStatusLabel(`Next challenge drops in ${days + 1} days`);
        }
      }
    };

    updateChallengeState();
    const interval = setInterval(updateChallengeState, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasAttemptedChallenge = completedQuizzes["weekly-challenge"] !== undefined;
  const challengeScore = completedQuizzes["weekly-challenge"] || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-all duration-300">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        
        {/* Premium Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-200/60 dark:border-slate-800/40 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              Virtual Science Lab
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
              Explore interactive Biology, Chemistry, and Physics experiments
            </p>
          </div>
          
          {/* Real-time Status Badges */}
          <div className="flex flex-wrap gap-3 items-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              {backendStatus || "Connecting..."}
            </span>
          </div>
        </div>

        {/* Weekly Science Challenge Card */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-300">
            {/* Background dynamic light flare overlay */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-4 max-w-xl">
                
                {/* Purple Schedular Badge */}
                {isMonday ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 shadow-sm shadow-emerald-500/5">
                    ⚡ Challenge Active
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200 dark:border-slate-800/40 shadow-sm">
                    🔒 Locked (Monday Drop)
                  </div>
                )}
                
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
                  Weekly science challenge
                </h2>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold leading-relaxed">
                  A time-limited bonus quiz or puzzle drops every Monday. First to complete earns a rare badge and bonus XP.
                </p>

                {/* Sub-points with Symmetrical Checks */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-5 h-5 rounded-full font-bold text-[10px] border ${isMonday ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"}`}>
                      ✓
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {isMonday ? "Countdown timer on homepage: " : "Next challenge drops in: "}
                      <span className="font-black text-indigo-500 font-mono tracking-wider">{timeLeft}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                      ✓
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      "{statusLabel}"
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                      ✓
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Exclusive "Explorer" badge reward
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Display Card */}
              <div className="w-full md:w-auto flex flex-col items-stretch md:items-center justify-center bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl md:min-w-[240px] text-center shadow-inner">
                <span className="text-3xl block animate-bounce mb-3">
                  {isMonday ? "💡" : "🔒"}
                </span>
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Weekly Challenge
                </span>
                
                {isMonday ? (
                  hasAttemptedChallenge ? (
                    <div className="mt-2 space-y-1">
                      <div className="text-sm font-black text-emerald-500">
                        ✓ Challenge Completed
                      </div>
                      <p className="text-[10px] font-medium text-slate-400">
                        Click below to view your result
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="text-sm font-black text-violet-500">
                        Not Attempted Yet
                      </div>
                      <p className="text-[10px] font-medium text-slate-400">
                        Earn +150 XP Bonus!
                      </p>
                    </div>
                  )
                ) : (
                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-black text-amber-500">
                      Unlocks on Monday
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 leading-normal max-w-[180px]">
                      Challenge drops at 00:00 every Monday!
                    </p>
                  </div>
                )}

                <button
                  disabled={!isMonday}
                  onClick={() => {
                    if (hasAttemptedChallenge) {
                      setShowResult(true);
                    } else {
                      setShowChallenge(true);
                    }
                  }}
                  className={`mt-5 w-full font-black text-xs py-3 px-6 rounded-xl transition-all duration-300 ${
                    isMonday
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 dark:from-blue-500 dark:to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.03] active:scale-[0.98]"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700/50"
                  }`}
                >
                  {!isMonday ? "Challenge Locked" : hasAttemptedChallenge ? "View Result" : "Start Challenge"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Symmetrical core laboratory cards */}
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-6 flex items-center gap-2">
            🔬 Interactive Core Labs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Biology */}
            <Link 
              to="/biology"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-black text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">
                  Biology
                </h4>
                <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🧬</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-3 leading-relaxed">
                Human anatomy and cell structures in 3D
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500">
                <span>Enter Bio Lab</span>
                <span>→</span>
              </div>
            </Link>

            {/* Chemistry */}
            <Link 
              to="/chemistry"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-black text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">
                  Chemistry
                </h4>
                <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🧪</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-3 leading-relaxed">
                Chemical reactions and laboratory apparatus
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-500">
                <span>Enter Chem Lab</span>
                <span>→</span>
              </div>
            </Link>

            {/* Physics */}
            <Link 
              to="/physics"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-black text-slate-800 dark:text-white group-hover:text-purple-500 transition-colors">
                  Physics
                </h4>
                <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🧲</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-3 leading-relaxed">
                Motion, magnetism, and physical laws
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-[10px] font-black uppercase text-purple-500">
                <span>Enter Physics Lab</span>
                <span>→</span>
              </div>
            </Link>

          </div>
        </div>

      </div>

      {/* Glassmorphic Quiz Overlay Modal */}
      {showChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowChallenge(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold transition-all z-10"
            >
              ✕
            </button>
            <div className="pt-2">
              <Quiz experimentId="weekly-challenge" subject="Physics" />
            </div>
          </div>
        </div>
      )}

      {/* Result Modal — shown after challenge is completed */}
      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <button
              onClick={() => setShowResult(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold transition-all"
            >
              ✕
            </button>

            {/* Score ring */}
            <div className="relative w-24 h-24 mx-auto mb-5">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                <circle
                  cx="48" cy="48" r="40" fill="none" strokeWidth="8"
                  stroke="url(#scoreGrad)"
                  strokeLinecap="round"
                  strokeDasharray={`${(challengeScore / 5) * 251.2} 251.2`}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{challengeScore}/5</span>
                <span className="text-[10px] font-bold text-slate-400">SCORE</span>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">Weekly Challenge Result</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-5">
              {Math.round((challengeScore / 5) * 100)}% correct · {challengeScore} out of 5 questions
            </p>

            {/* Badge status */}
            <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black mb-6 ${
              challengeScore >= 4
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}>
              {challengeScore >= 4
                ? "🏅 Explorer Badge Earned!"
                : `⚡ Need ${4 - challengeScore} more correct for Explorer Badge`}
            </div>

            {challengeScore >= 4 && (
              <Link
                to="/profile"
                onClick={() => setShowResult(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs tracking-wider uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md shadow-indigo-500/20 mb-3"
              >
               View Badge!
              </Link>
            )}

            <button
              onClick={() => setShowResult(false)}
              className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs tracking-wider uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Home;
