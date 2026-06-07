import { useMemo, useState, memo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useGamificationMeta } from "../context/GamificationContext";
import quizData from "../data/quizzes.json";
import { offlineDb } from "../utils/offlineDb";
import API_URL from "../config";

const BASE_URL = 
  typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : API_URL;

const formatDateTime = (value) => {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getScoreTone = (score, total) => {
  const percent = total ? score / total : 0;
  if (percent >= 0.8) return "text-emerald-600 dark:text-emerald-400";
  if (percent >= 0.5) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const Quiz = ({ experimentId, subject }) => {
  // ⚡ Critical Optimization: Use low-frequency Meta context to completely bypass high-frequency XP state updates
  const { submitQuiz, completedQuizzes, quizAttempts } = useGamificationMeta();
  const questions = quizData.quizzes[experimentId] || [];

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [xpReport, setXpReport] = useState(null);

  const experimentAttempts = useMemo(
    () => (quizAttempts || []).filter((attempt) => attempt.experiment_id === experimentId),
    [quizAttempts, experimentId]
  );

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIdx];
  const selectedOption = selectedAnswers[currentIdx];
  const isAnswered = selectedOption !== undefined;
  const correctAnswers = selectedAnswers.reduce(
    (total, answer, index) => total + (answer === questions[index]?.correct ? 1 : 0),
    0
  );
  const previousHighScore = completedQuizzes[experimentId] ?? -1;
  const scorePercent = Math.round((correctAnswers / questions.length) * 100);

  const handleStart = () => {
    setQuizStarted(true);
    setCurrentIdx(0);
    setSelectedAnswers([]);
    setQuizFinished(false);
    setSubmitted(false);
    setXpReport(null);
  };

  const handleOptionSelect = (optionIdx) => {
    if (isAnswered) return;
    setSelectedAnswers((answers) => {
      const nextAnswers = [...answers];
      nextAnswers[currentIdx] = optionIdx;
      return nextAnswers;
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleSubmitScore = async () => {
    setSubmitting(true);

    const historyRecord = {
      user_id: "default-student", 
      experiment_name: experimentId, 
      subject: subject,
      score: correctAnswers,
      timestamp: new Date().toISOString()
    };

    const result = await submitQuiz(
      experimentId,
      correctAnswers,
      subject,
      selectedAnswers,
      questions.length
    );

    await offlineDb.saveExperimentHistory(historyRecord);
    await offlineDb.queueAction("experiment_history", historyRecord);

    if (navigator.onLine) {
      try {
        await fetch(`${BASE_URL}/api/progress/history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(historyRecord),
        });
      } catch (e) {
        console.warn("Immediate history sync failed, queued for retry.", e);
      }
    }

    setSubmitting(false);
    setSubmitted(true);
    if (result) {
      setXpReport(result);
    }
  };

  const getExplanation = (question) =>
    question.explanation ||
    `Correct answer: ${question.options[question.correct]}. Review the experiment notes to connect this concept with the observation.`;

  const getOptionStyle = (index) => {
    if (!isAnswered) {
      return "border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer";
    }
    if (index === currentQuestion.correct) {
      return "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 font-semibold";
    }
    if (selectedOption === index && index !== currentQuestion.correct) {
      return "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-300";
    }
    return "border-slate-200 text-slate-500 dark:text-slate-400 opacity-70 dark:border-slate-800";
  };

  return (
    <section className="mt-8 mx-auto max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900">
      <AnimatePresence mode="wait">
        {!quizStarted ? (
          <Motion.div
            key="start"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-center py-3"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              Q
            </div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Performance evaluation
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Experiment Quiz
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Answer {questions.length} conceptual and observation-based questions, then review your score and explanations.
            </p>

            <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <span className="block text-[10px] font-black uppercase text-slate-400">Best score</span>
                <strong className="text-lg text-slate-800 dark:text-slate-100">
                  {previousHighScore === -1 ? "New" : `${previousHighScore}/${questions.length}`}
                </strong>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <span className="block text-[10px] font-black uppercase text-slate-400">Attempts</span>
                <strong className="text-lg text-slate-800 dark:text-slate-100">{experimentAttempts.length}</strong>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <span className="block text-[10px] font-black uppercase text-slate-400">Reward</span>
                <strong className="text-lg text-slate-800 dark:text-slate-100">
                  {previousHighScore === -1 ? "XP ready" : "Improve"}
                </strong>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="rounded-lg bg-blue-600 px-7 py-3 text-xs font-extrabold uppercase tracking-wide text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-95"
            >
              {previousHighScore === -1 ? "Start Quiz" : "Retake Quiz"}
            </button>
          </Motion.div>
        ) : !quizFinished ? (
          <Motion.div
            key="running"
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -22 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% complete</span>
            </div>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            <h4 className="mb-5 text-lg font-bold leading-snug text-slate-800 dark:text-slate-100">
              {currentQuestion.question}
            </h4>

            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={option}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full rounded-lg border p-4 text-left text-sm font-medium transition-all duration-200 ${getOptionStyle(idx)}`}
                >
                  <span className="flex items-center justify-between gap-4">
                    <span>{option}</span>
                    {isAnswered && idx === currentQuestion.correct && <span className="text-emerald-500">Correct</span>}
                    {isAnswered && selectedOption === idx && idx !== currentQuestion.correct && <span className="text-rose-500">Incorrect</span>}
                  </span>
                </button>
              ))}
            </div>

            {isAnswered && (
              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-left dark:border-blue-900/50 dark:bg-blue-950/20">
                <p className="text-xs font-black uppercase text-blue-700 dark:text-blue-300">Explanation</p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                  {getExplanation(currentQuestion)}
                </p>
              </div>
            )}

            {isAnswered && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  className="rounded-lg bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700 active:scale-95 dark:bg-slate-100 dark:text-slate-900"
                >
                  {currentIdx === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </button>
              </div>
            )}
          </Motion.div>
        ) : (
          <Motion.div
            key="finished"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-2"
          >
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Result summary
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-800 dark:text-slate-100">
                Quiz Completed
              </h3>
              <div className="my-5">
                <span className={`text-5xl font-extrabold ${getScoreTone(correctAnswers, questions.length)}`}>
                  {correctAnswers}/{questions.length}
                </span>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {scorePercent}% accuracy
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {questions.map((question, index) => {
                const answer = selectedAnswers[index];
                const isCorrect = answer === question.correct;
                return (
                  <div
                    key={question.question}
                    className="rounded-lg border border-slate-200 p-4 text-left dark:border-slate-800"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {index + 1}. {question.question}
                      </h4>
                      <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}>
                        {isCorrect ? "Correct" : "Review"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Your answer: {question.options[answer] || "Not answered"}
                    </p>
                    {!isCorrect && (
                      <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Correct answer: {question.options[question.correct]}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {getExplanation(question)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={handleStart}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Retry Quiz
              </button>

              {!submitted ? (
                <button
                  onClick={handleSubmitScore}
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition hover:bg-blue-500 active:scale-95 disabled:cursor-wait disabled:opacity-70"
                >
                  {submitting ? "Submitting..." : "Submit Evaluation"}
                </button>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Evaluation saved
                  </span>
                  {xpReport && (
                    <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      +{xpReport.xpEarned} XP earned. Total XP: {xpReport.totalXp}
                    </p>
                  )}
                </div>
              )}
            </div>

            {experimentAttempts.length > 0 && (
              <div className="mt-8 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="font-black text-slate-800 dark:text-slate-100">Previous Attempts</h4>
                  <span className="text-xs font-bold text-slate-400">{experimentAttempts.length} saved</span>
                </div>
                <div className="space-y-2">
                  {experimentAttempts.slice(0, 4).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50"
                    >
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {formatDateTime(attempt.attempted_at)}
                      </span>
                      <strong className={getScoreTone(attempt.score, attempt.total_questions)}>
                        {attempt.score}/{attempt.total_questions}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// Component Layout Lifecycle Guarding: Prevent parent re-renders from trickling down
export default memo(Quiz);