import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useGamification } from "../context/GamificationContext";
import quizData from "../data/quizzes.json";

const Quiz = ({ experimentId, subject }) => {
  const { submitQuiz, completedQuizzes } = useGamification();
  const questions = quizData.quizzes[experimentId] || [];

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [xpReport, setXpReport] = useState(null);

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIdx];
  const previousHighScore = completedQuizzes[experimentId] ?? -1;

  const handleStart = () => {
    setQuizStarted(true);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswers(0);
    setQuizFinished(false);
    setSubmitted(false);
    setXpReport(null);
  };

  const handleOptionSelect = (optionIdx) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);
    if (optionIdx === currentQuestion.correct) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleSubmitScore = async () => {
    setSubmitting(true);
    const result = await submitQuiz(experimentId, correctAnswers, subject);
    setSubmitting(false);
    setSubmitted(true);
    if (result) {
      setXpReport(result);
    }
  };

  // Beautiful visual feedback helper classes
  const getOptionStyle = (index) => {
    if (!isAnswered) {
      return "border-slate-300 hover:border-violet-500 hover:bg-violet-50 text-slate-700 dark:text-slate-300 dark:hover:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer";
    }
    if (index === currentQuestion.correct) {
      return "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 font-semibold";
    }
    if (selectedOption === index && index !== currentQuestion.correct) {
      return "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-300";
    }
    return "border-slate-200 text-slate-500 dark:text-slate-400 opacity-60 dark:border-slate-800";
  };

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!quizStarted ? (
          <Motion.div
            key="start"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="text-center py-4"
          >
            {experimentId === "weekly-challenge" ? (
              <>
                {/* Weekly Challenge — special icon ring */}
                <div className="relative w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/30">
                  <div className="absolute inset-1 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                    <span className="text-4xl">💡</span>
                  </div>
                  {/* Animated outer ring pulse */}
                  <div className="absolute -inset-1 rounded-full border-2 border-cyan-400/40 animate-ping" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 mb-4">
                  Available Mondays Only
                </div>

                <h3 className="text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400">
                  Weekly Challenge
                </h3>

                <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-sm mx-auto text-xs font-semibold leading-relaxed">
                  A special quiz that drops every <strong className="text-slate-700 dark:text-slate-200">Monday</strong> - covering Biology, Chemistry & Physics. Score <strong className="text-slate-700 dark:text-slate-200">4 or more</strong> to unlock the exclusive <strong className="text-cyan-600 dark:text-cyan-400"> Explorer Badge</strong>!
                </p>

                {/* Weekly Challenge Reward Panel */}
                <div className="flex flex-wrap justify-center gap-3 my-6">
                  {previousHighScore === -1 ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      ⚡ +150 XP First Attempt Bonus
                    </div>
                  ) : previousHighScore < questions.length ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      ⚡ +{(questions.length - previousHighScore) * 10} XP Improvement
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                      ⚡ Practice Mode
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                     Explorer Badge (score 4+/5)
                  </div>

                  {previousHighScore !== -1 && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${previousHighScore >= 4
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}>
                      ⭐ Best: {previousHighScore}/{questions.length} {previousHighScore >= 4 ? "🏅" : ""}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleStart}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-98 shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30"
                >
                  {previousHighScore === -1 ? "Accept the Challenge" : "Re-attempt Challenge"}
                </button>
              </>
            ) : (
              <>
                {/* Regular experiment quiz — original design */}
                <div className="relative w-16 h-16 mx-auto mb-6 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <div className="absolute inset-0.5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                    <span className="text-3xl animate-bounce">🎓</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                  Test Your Understanding!
                </h3>

                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto text-xs font-semibold leading-relaxed">
                  Complete a quick {questions.length}-question conceptual quiz on this experiment to test your learning, earn experience points, and unlock badges!
                </p>

                {/* Gamification Rewards Panel */}
                <div className="flex flex-wrap justify-center gap-3 my-6">
                  {previousHighScore === -1 ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      ⚡ +100 XP Max Reward
                    </div>
                  ) : previousHighScore < questions.length ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      ⚡ +{(questions.length - previousHighScore) * 10} XP Improvement
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                       Practice Mode 
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    🏆 Subject Badge
                  </div>

                  {previousHighScore !== -1 && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${previousHighScore === questions.length
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}>
                      ⭐ Record: {previousHighScore}/{questions.length}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleStart}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-98 shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  {previousHighScore === -1 ? "Challenge Quiz →" : "Re-attempt Quiz"}
                </button>
              </>
            )}
          </Motion.div>
        ) : !quizFinished ? (
          <Motion.div
            key="running"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header progress bar */}
            <div className="flex justify-between items-center mb-4 text-xs font-semibold text-slate-400">
              <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 leading-snug">
              {currentQuestion.question}
            </h4>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full p-4 text-left border rounded-xl transition-all duration-200 text-sm font-medium ${getOptionStyle(
                    idx
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isAnswered && idx === currentQuestion.correct && (
                      <span className="text-emerald-500 text-base">✓</span>
                    )}
                    {isAnswered && selectedOption === idx && idx !== currentQuestion.correct && (
                      <span className="text-rose-500 text-base">✗</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            {isAnswered && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs hover:bg-slate-700 hover:scale-[1.02] active:scale-95 transition-all duration-150"
                >
                  {currentIdx === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </button>
              </div>
            )}
          </Motion.div>
        ) : (
          <Motion.div
            key="finished"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Quiz Completed!</h3>

            <div className="my-6">
              <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                {correctAnswers} / {questions.length}
              </span>
              <p className="text-slate-400 dark:text-slate-500 font-medium text-xs mt-2 uppercase tracking-wider">
                {correctAnswers === questions.length
                  ? "Perfect Score! 🌟"
                  : correctAnswers >= Math.ceil(questions.length / 2)
                    ? "Great job! 👍"
                    : "Keep studying! 📚"}
              </p>
            </div>

            {/* Score Comparison Info */}
            <p className="text-slate-500 dark:text-slate-400 text-xs px-6">
              You correctly answered {correctAnswers} out of {questions.length} questions.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleStart}
                className="px-5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Retry Quiz
              </button>

              {!submitted ? (
                <button
                  onClick={handleSubmitScore}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-500/10 flex items-center justify-center gap-2"
                >
                  {submitting ? "Submitting..." : "Submit Score"}
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
                  <span className="text-emerald-500 font-bold text-xs flex items-center gap-1.5">
                    ✓ Score Submitted Successfully!
                  </span>
                  {xpReport && xpReport.xpEarned > 0 && (
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">
                      Earned +{xpReport.xpEarned} XP (Total XP: {xpReport.totalXp} XP)
                    </span>
                  )}
                  {xpReport && xpReport.xpEarned === 0 && (
                    <span className="text-slate-400 text-[10px] mt-0.5">
                      No new XP earned (previous high score matched/unbeaten)
                    </span>
                  )}
                </div>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
