import { useState } from "react";
import { useGamification } from "../context/GamificationContext";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";

const BADGES_CONFIG = [
  {
    id: "Junior Biologist",
    title: "Junior Biologist",
    description: "Score 100% (5/5) on at least one Biology experiment quiz.",
    emoji: "🔬",
    subject: "Biology",
    color: "from-green-400 to-emerald-600 shadow-emerald-500/20 text-emerald-100"
  },
  {
    id: "Biology Pro",
    title: "Biology Pro",
    description: "Complete all 4 Biology quizzes with a perfect score (5/5).",
    emoji: "🧬",
    subject: "Biology",
    color: "from-emerald-500 to-teal-700 shadow-teal-500/20 text-teal-100"
  },
  {
    id: "Junior Chemist",
    title: "Junior Chemist",
    description: "Score 100% (5/5) on at least one Chemistry experiment quiz.",
    emoji: "🧪",
    subject: "Chemistry",
    color: "from-blue-400 to-indigo-600 shadow-blue-500/20 text-blue-100"
  },
  {
    id: "Chemistry Pro",
    title: "Chemistry Pro",
    description: "Complete all 3 Chemistry quizzes with a perfect score (5/5).",
    emoji: "⚗️",
    subject: "Chemistry",
    color: "from-purple-500 to-violet-700 shadow-violet-500/20 text-violet-100"
  },
  {
    id: "Junior Physicist",
    title: "Junior Physicist",
    description: "Score 100% (5/5) on at least one Physics experiment quiz.",
    emoji: "🧲",
    subject: "Physics",
    color: "from-amber-400 to-orange-600 shadow-orange-500/20 text-orange-100"
  },
  {
    id: "Physics Pro",
    title: "Physics Pro",
    description: "Complete all 4 Physics quizzes with a perfect score (5/5).",
    emoji: "⚛️",
    subject: "Physics",
    color: "from-red-500 to-pink-700 shadow-pink-500/20 text-pink-100"
  },
  {
    id: "Science Champion",
    title: "Science Champion",
    description: "Achieve master comprehension with 100% score on all 11 quizzes!",
    emoji: "🏆",
    subject: "All",
    color: "from-yellow-400 via-amber-500 to-yellow-600 shadow-yellow-500/30 text-yellow-50 font-black animate-pulse"
  },
  {
    id: "Explorer",
    title: "Explorer",
    description: "Complete a Weekly 'Monday' Challenge with a score of 4/5 or better!",
    emoji: "💡",
    subject: "Challenge",
    color: "from-cyan-400 to-blue-500 shadow-cyan-500/20 text-cyan-100 font-extrabold"
  }
];

const EXPERIMENTS_ROADMAP = [
  { id: "human-body", title: "Human Body Anatomy", subject: "Biology", link: "/biology/human-body" },
  { id: "mitochondria", title: "Mitochondria Powerhouse", subject: "Biology", link: "/biology/mitochondria" },
  { id: "eye", title: "Eye Anatomy", subject: "Biology", link: "/biology/eye" },
  { id: "kidney", title: "Kidney Filtration", subject: "Biology", link: "/biology/kidney" },
  { id: "chemistry-equipment", title: "Laboratory Equipment Set", subject: "Chemistry", link: "/chemistry/chemistry-equipment" },
  { id: "volcano-experiment", title: "Volcano Chemical Reaction", subject: "Chemistry", link: "/chemistry/volcano-experiment" },
  { id: "condenser", title: "Glass Vapor Condenser", subject: "Chemistry", link: "/chemistry/condenser" },
  { id: "velocity-acceleration", title: "Velocity & Acceleration Laws", subject: "Physics", link: "/physics/velocity-acceleration" },
  { id: "magnetic-field-wires", title: "Magnetic Fields (Two Wires)", subject: "Physics", link: "/physics/magnetic-field-wires" },
  { id: "thumb-rule", title: "Right-Hand Thumb Rule", subject: "Physics", link: "/physics/thumb-rule" },
  { id: "magnetic-field-direction", title: "Field Around Straight Conductor", subject: "Physics", link: "/physics/magnetic-field-direction" }
];

const getRank = (xp) => {
  if (xp < 150) return { level: 1, title: "Apprentice Researcher", nextXp: 150, prevXp: 0 };
  if (xp < 450) return { level: 2, title: "Junior Lab Assistant", nextXp: 450, prevXp: 150 };
  if (xp < 950) return { level: 3, title: "Senior Experimenter", nextXp: 950, prevXp: 450 };
  if (xp < 1800) return { level: 4, title: "Master Innovator", nextXp: 1800, prevXp: 950 };
  return { level: 5, title: "Grand Science Fellow", nextXp: null, prevXp: 1800 };
};

const Profile = () => {
  const { xp, completedQuizzes, unlockedBadges, loading } = useGamification();
  const [activeTab, setActiveTab] = useState("achievements");

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto" />
          <p className="mt-4 font-bold text-slate-500 dark:text-slate-400">Loading student stats...</p>
        </div>
      </div>
    );
  }

  const rank = getRank(xp);
  
  // Calculate level progress percentage
  let progressPercent = 100;
  if (rank.nextXp) {
    const range = rank.nextXp - rank.prevXp;
    const currentInRange = xp - rank.prevXp;
    progressPercent = Math.min(Math.max((currentInRange / range) * 100, 0), 100);
  }
  
  // Group experiments by subject
  const subjectsMap = {
    Biology: ["human-body", "mitochondria", "eye", "kidney"],
    Chemistry: ["chemistry-equipment", "volcano-experiment", "condenser"],
    Physics: ["velocity-acceleration", "magnetic-field-wires", "thumb-rule", "magnetic-field-direction"]
  };

  // Calculate score average percentage for each subject
  const getSubjectStats = () => {
    let stats = {
      Biology: { sum: 0, count: 0 },
      Chemistry: { sum: 0, count: 0 },
      Physics: { sum: 0, count: 0 }
    };

    // Populate actual quiz scores
    Object.entries(completedQuizzes).forEach(([expId, score]) => {
      let foundSubject = null;
      Object.entries(subjectsMap).forEach(([subj, exps]) => {
        if (exps.includes(expId)) {
          foundSubject = subj;
        }
      });

      if (foundSubject) {
        stats[foundSubject].sum += score;
        stats[foundSubject].count += 1;
      }
    });

    const getAvgPercent = (subj) => {
      const s = stats[subj];
      if (s.count === 0) return 0;
      return Math.round((s.sum / (s.count * 5)) * 100);
    };

    const bioPercent = getAvgPercent("Biology");
    const chemPercent = getAvgPercent("Chemistry");
    const physPercent = getAvgPercent("Physics");

    // Diligence score = percentage of all 11 experiments completed
    const completedCount = Object.keys(completedQuizzes).length;
    const diligencePercent = Math.round((completedCount / 11) * 100);

    return {
      scores: {
        Biology: bioPercent,
        Chemistry: chemPercent,
        Physics: physPercent,
        Diligence: diligencePercent
      },
      counts: {
        Biology: stats["Biology"].count,
        Chemistry: stats["Chemistry"].count,
        Physics: stats["Physics"].count
      }
    };
  };

  const subjectAnalytics = getSubjectStats();
  const scores = subjectAnalytics.scores;

  // Calculate overall performance stats
  const overallAverage = Math.round(
    (scores.Biology + scores.Chemistry + scores.Physics) / 3
  );

  // Determine Strongest and Weakest subjects (handling ties beautifully)
  const subjectsList = [
    { name: "Biology", score: scores.Biology, count: subjectAnalytics.counts.Biology },
    { name: "Chemistry", score: scores.Chemistry, count: subjectAnalytics.counts.Chemistry },
    { name: "Physics", score: scores.Physics, count: subjectAnalytics.counts.Physics }
  ];

  const attemptedSubjects = subjectsList.filter(s => s.count > 0);
  
  let strongestDisplay = { name: "None", score: 0 };
  let weakestDisplay = { name: "None", score: 0 };
  
  if (attemptedSubjects.length > 0) {
    const maxScore = Math.max(...attemptedSubjects.map(s => s.score));
    const strongestList = attemptedSubjects.filter(s => s.score === maxScore);
    strongestDisplay = {
      name: strongestList.map(s => s.name).join(" & "),
      score: maxScore
    };
    
    const minScore = Math.min(...attemptedSubjects.map(s => s.score));
    const weakestList = attemptedSubjects.filter(s => s.score === minScore);
    
    if (minScore === 100) {
      weakestDisplay = {
        name: "None (All Perfect!)",
        score: 100
      };
    } else {
      weakestDisplay = {
        name: weakestList.map(s => s.name).join(" & "),
        score: minScore
      };
    }
  }

  const weakestSubject = attemptedSubjects.length > 0 ? [...subjectsList].sort((a,b) => a.score - b.score)[0] : { name: "None", score: 0, count: 0 };

  // Dynamic Suggested Experiments (only showing attempted quizzes that need score improvement)
  const getSuggestions = () => {
    let suggestions = [];
    const orderedSubjects = [weakestSubject.name, "Chemistry", "Biology", "Physics"].filter((v, i, a) => a.indexOf(v) === i);
    
    for (const subj of orderedSubjects) {
      const exps = subjectsMap[subj];
      for (const expId of exps) {
        const score = completedQuizzes[expId];
        if (score !== undefined && score < 5) {
          const originalExp = EXPERIMENTS_ROADMAP.find(e => e.id === expId);
          if (originalExp) {
            suggestions.push({
              ...originalExp,
              reason: `Improve Score (${score}/5)`
            });
          }
        }
      }
    }
    return suggestions.slice(0, 3);
  };

  const suggestedFocus = getSuggestions();

  return (
    <div className="fade-in max-w-6xl mx-auto px-4 py-8 bg-transparent min-h-screen">
      <BackButton label="Back to Lab" />
      
      {/* 1. HEADER HERO PANEL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-xl mb-8">
        {/* Dynamic circular backdrop vectors */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-xl" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-col sm:flex-row text-center sm:text-left">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl border border-white/20 shadow-inner">
              👨‍🔬
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest bg-white/25 px-3 py-1 rounded-full text-white/95">
                Level {rank.level}
              </span>
              <h2 className="text-3xl font-black mt-2 tracking-tight">{rank.title}</h2>
              <p className="text-white/80 text-xs font-bold mt-1">Virtual Science Lab Student</p>
            </div>
          </div>

          <div className="text-center md:text-right shrink-0">
            <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Total Experience Points</p>
            <p className="text-5xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-200 bg-clip-text text-transparent">
              {xp} <span className="text-2xl font-black text-amber-300">XP</span>
            </p>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="mt-8 border-t border-white/15 pt-6">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span>Level {rank.level} Progress</span>
            {rank.nextXp ? (
              <span>{xp} / {rank.nextXp} XP ({rank.nextXp - xp} XP to Level {rank.level + 1})</span>
            ) : (
              <span>Max Rank Achieved! 🎓</span>
            )}
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-300 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-md shadow-amber-300/10"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sleek Modern Dashboard Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-6">
        <button
          onClick={() => setActiveTab("achievements")}
          className={`pb-4 text-sm font-black transition-all duration-300 relative ${
            activeTab === "achievements"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
          }`}
        >
          Achievements & Badges 🏆
          {activeTab === "achievements" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-4 text-sm font-black transition-all duration-300 relative flex items-center gap-1.5 ${
            activeTab === "analytics"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
          }`}
        >
          Performance Analytics
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] px-1.5 py-0.5 rounded font-black uppercase animate-pulse">
            New
          </span>
          {activeTab === "analytics" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {activeTab === "achievements" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BADGES SHOWCASE SECTION (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-6 flex items-center gap-2">
                🏆 Subject & Comprehension Badges ({unlockedBadges.length} / {BADGES_CONFIG.length})
              </h3>
              
              {/* Gained all badges congratulations card */}
              {unlockedBadges.length === BADGES_CONFIG.length && (
                <div className="bg-gradient-to-r from-yellow-500/15 via-amber-500/20 to-yellow-500/15 dark:from-yellow-500/5 dark:via-amber-500/10 dark:to-yellow-500/5 border border-amber-500/30 dark:border-amber-500/20 rounded-xl p-5 mb-6 text-center shadow-md relative overflow-hidden animate-pulse">
                  <span className="text-4xl mb-2 block">👑</span>
                  <h4 className="font-extrabold text-amber-700 dark:text-amber-400 text-base">
                    Master Scientist Status Gained!
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-1.5 leading-relaxed max-w-lg mx-auto">
                    Outstanding achievement! You have successfully unlocked all <strong>{BADGES_CONFIG.length} badges</strong> across all science experiments. You have demonstrated perfect conceptual understanding and experimental precision! 🎓🔬✨
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BADGES_CONFIG.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`relative overflow-hidden rounded-xl border p-4 flex gap-4 transition-all duration-300 ${
                        isUnlocked
                          ? `bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 shadow-sm hover:scale-[1.02]`
                          : "bg-slate-100/50 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-900/40 opacity-40 grayscale"
                      }`}
                    >
                      {/* Badge Emoji container */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-md shrink-0 ${
                        isUnlocked ? badge.color : "from-slate-300 to-slate-400 text-slate-100 dark:from-slate-700 dark:to-slate-800"
                      }`}>
                        {badge.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate">
                            {badge.title}
                          </h4>
                          {isUnlocked ? (
                            <span className="text-[9px] font-black tracking-wide uppercase bg-emerald-500/10 text-emerald-500 py-0.5 px-2 rounded-full border border-emerald-500/10">
                              Active
                            </span>
                          ) : (
                            <span className="text-[9px] font-black tracking-wide uppercase bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400 py-0.5 px-2 rounded-full">
                              Locked
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">
                          {badge.subject} Suite
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-snug">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* EXPERIMENT LAB CHECKLIST (1/3 width on desktop) */}
          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-6 flex items-center gap-2">
                🧪 Lab Roadmap
              </h3>
              
              <p className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-wider">
                Experiments Checklist
              </p>

              <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto py-1 px-1">
                {EXPERIMENTS_ROADMAP.map((exp) => {
                  const score = completedQuizzes[exp.id];
                  const isCompleted = score !== undefined;
                  
                  return (
                    <Link
                      key={exp.id}
                      to={exp.link}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01] hover:shadow-md ${
                        isCompleted
                          ? "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/50"
                          : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}>
                          {isCompleted ? "✓" : "○"}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-200">
                            {exp.title}
                          </h4>
                          <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">
                            {exp.subject}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {isCompleted ? (
                          <div className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            score === 5
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {score}/5 ⭐
                          </div>
                        ) : (
                          <div className="text-[10px] text-violet-500 dark:text-violet-400 font-bold hover:underline">
                            Start →
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PERFORMANCE ANALYTICS TAB CONTENT */
        <div className="space-y-8 text-left">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Overall score
              </p>
              <h4 className="text-3xl font-black mt-2 text-slate-800 dark:text-slate-100 flex items-baseline gap-1">
                {overallAverage === 0 ? "0%" : `${overallAverage}%`}
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Average
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                across all subjects
              </p>
            </div>

            {/* Strongest Subject Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Strongest subject
              </p>
              <h4 className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400 flex items-baseline gap-2 flex-wrap">
                {strongestDisplay.name === "None" ? "N/A" : strongestDisplay.name}
                {strongestDisplay.score > 0 && (
                  <span className="text-xs font-black text-emerald-500/80 uppercase">
                    {strongestDisplay.score}/100
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Highest performance index
              </p>
            </div>

            {/* Needs Work Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Needs work
              </p>
              <h4 className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400 flex items-baseline gap-2 flex-wrap">
                {weakestDisplay.name === "None" ? "All Subjects" : weakestDisplay.name}
                {weakestDisplay.score > 0 && weakestDisplay.name !== "None (All Perfect!)" && (
                  <span className="text-xs font-black text-amber-500/80 uppercase">
                    {weakestDisplay.score}/100
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Lowest performance index
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* RADAR CHART AND SUGGESTED FOCUS (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Radar Chart Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                      📊 Personal Performance Dashboard
                    </h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">
                      Multi-dimensional evaluation of your conceptual strength.
                    </p>
                  </div>

                  {/* Legends */}
                  <div className="flex gap-4 text-[10px] font-black uppercase">
                    <div className="flex items-center gap-1.5 text-indigo-500">
                      <span className="inline-block w-2.5 h-2.5 rounded bg-indigo-500" />
                      This Student
                    </div>
                  </div>
                </div>

                <div className="flex justify-center py-4">
                  {/* Radar Chart SVG */}
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 320 320"
                    className="max-w-[280px] sm:max-w-[320px] overflow-visible text-slate-700 dark:text-slate-200"
                  >
                    <defs>
                      <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                      </radialGradient>
                    </defs>

                    {/* Radial grid benchmarks at 25%, 50%, 75%, 100% */}
                    {[0.25, 0.50, 0.75, 1.0].map((scale) => {
                      const gridR = 100 * scale;
                      return (
                        <polygon
                          key={scale}
                          points={`160,${160 - gridR} ${160 + gridR},160 160,${160 + gridR} ${160 - gridR},160`}
                          fill="none"
                          stroke="currentColor"
                          className="text-slate-200 dark:text-slate-800/80"
                          strokeWidth="1"
                          strokeDasharray={scale === 1 ? "none" : "3 3"}
                        />
                      );
                    })}

                    {/* Concentric grid labels */}
                    <text x="164" y={160 - 100 * 0.25 + 3} className="fill-slate-400 dark:fill-slate-500 font-bold text-[8px] select-none pointer-events-none">25%</text>
                    <text x="164" y={160 - 100 * 0.50 + 3} className="fill-slate-400 dark:fill-slate-500 font-bold text-[8px] select-none pointer-events-none">50%</text>
                    <text x="164" y={160 - 100 * 0.75 + 3} className="fill-slate-400 dark:fill-slate-500 font-bold text-[8px] select-none pointer-events-none">75%</text>
                    <text x="164" y={160 - 100 * 1.0 + 3} className="fill-slate-400 dark:fill-slate-500 font-bold text-[8px] select-none pointer-events-none">100%</text>

                    {/* Horizontal & Vertical grid axes lines */}
                    <line x1="160" y1="60" x2="160" y2="260" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                    <line x1="60" y1="160" x2="260" y2="160" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />

                    {/* AXIS LABELS */}
                    <text x="160" y="44" textAnchor="middle" className="font-extrabold text-[10px] fill-slate-700 dark:fill-slate-200">Biology</text>
                    <text x="268" y="163" textAnchor="start" className="font-extrabold text-[10px] fill-slate-700 dark:fill-slate-200">Chemistry</text>
                    <text x="160" y="278" textAnchor="middle" className="font-extrabold text-[10px] fill-slate-700 dark:fill-slate-200">Physics</text>
                    <text x="52" y="163" textAnchor="end" className="font-extrabold text-[10px] fill-slate-700 dark:fill-slate-200">Lab Skills</text>



                    {/* Student Performance Polygon (Filled gradient, glowing outline) */}
                    {(() => {
                      const bioVal = Math.max(0.1, scores.Biology / 100);
                      const chemVal = Math.max(0.1, scores.Chemistry / 100);
                      const physVal = Math.max(0.1, scores.Physics / 100);
                      const dilVal = Math.max(0.1, scores.Diligence / 100);

                      const pBio = { x: 160, y: 160 - 100 * bioVal };
                      const pChem = { x: 160 + 100 * chemVal, y: 160 };
                      const pPhys = { x: 160, y: 160 + 100 * physVal };
                      const pDil = { x: 160 - 100 * dilVal, y: 160 };

                      const pointsStr = `${pBio.x},${pBio.y} ${pChem.x},${pChem.y} ${pPhys.x},${pPhys.y} ${pDil.x},${pDil.y}`;
                      return (
                        <>
                          {/* Inner glowing polygon */}
                          <polygon
                            points={pointsStr}
                            fill="url(#radarGlow)"
                            stroke="#6366f1"
                            strokeWidth="2.5"
                          />
                          {/* Interactive glowing corner dots */}
                          <circle cx={pBio.x} cy={pBio.y} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={pChem.x} cy={pChem.y} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={pPhys.x} cy={pPhys.y} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={pDil.x} cy={pDil.y} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="1.5" />
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Dynamic Suggested Focus Section */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-2 flex items-center gap-2">
                  🎯 Suggested Focus Areas
                </h3>
                <p className="text-slate-400 text-xs font-medium mb-6">
                  Recommended science exercises to target your lower quiz averages.
                </p>

                {suggestedFocus.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {suggestedFocus.map((exp) => (
                      <Link
                        key={exp.id}
                        to={exp.link}
                        className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/10 hover:border-violet-500 dark:hover:border-violet-500/80 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between"
                      >
                        <div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            exp.subject === "Biology"
                              ? "bg-green-500/10 border-green-500/10 text-green-500"
                              : exp.subject === "Chemistry"
                              ? "bg-blue-500/10 border-blue-500/10 text-blue-500"
                              : "bg-amber-500/10 border-amber-500/10 text-amber-500"
                          }`}>
                            {exp.subject}
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-3.5 leading-snug">
                            {exp.title}
                          </h4>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                          <span className="text-[9px] font-black text-rose-500 dark:text-rose-400">
                            {exp.reason}
                          </span>
                          <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400">
                            Launch →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/20">
                    <span className="text-3xl block">🎯</span>
                    <p className="font-bold text-xs text-indigo-500 dark:text-indigo-400 mt-2">No Quiz Re-attempts Needed!</p>
                    <p className="text-[10px] text-slate-400 mt-1">All attempted quizzes are at perfect scores, or you have not attempted any quizzes yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* QUIZ SCORE TRENDS TIMELINE (1/3 width) */}
            <div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-2 flex items-center gap-2">
                  📈 Quiz score trends
                </h3>
                <p className="text-slate-400 text-xs font-medium mb-6">
                  Chronological progression timeline of your scores.
                </p>

                {Object.keys(completedQuizzes).length > 0 ? (
                  <div className="relative flex flex-col gap-6 max-h-[460px] overflow-y-auto py-1.5 pr-1">
                    {/* Chronological vertical line tracker */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-slate-200 dark:bg-slate-800" />

                    {Object.entries(completedQuizzes).map(([expId, score]) => {
                      const exp = EXPERIMENTS_ROADMAP.find(e => e.id === expId);
                      return (
                        <div key={expId} className="relative pl-7 text-left group">
                          {/* Chronological bullet marker node */}
                          <span className={`absolute left-[11px] top-[5px] w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 shadow-md ${
                            score === 5
                              ? "bg-emerald-500 shadow-emerald-500/20 animate-pulse"
                              : "bg-amber-500 shadow-amber-500/20"
                          }`} />

                          <div>
                            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                              {exp ? exp.title : expId}
                            </h4>
                            <div className="flex justify-between items-center mt-2.5">
                              <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                {exp ? exp.subject : "Science"}
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                score === 5
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-amber-500/10 text-amber-500"
                              }`}>
                                {score}/5 ⭐
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/20">
                    <span className="text-3xl block">📈</span>
                    <p className="font-bold text-xs text-slate-400 mt-3">No Quiz Attempts Recorded Yet</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 px-4 leading-relaxed">
                      Complete post-experiment quizzes in your roadmap checklist to build your learning trend!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
