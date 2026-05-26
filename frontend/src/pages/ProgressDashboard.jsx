import { useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useGamification } from "../context/GamificationContext";
import { useProgress } from "../context/ProgressContext";
import { EXPERIMENT_CATALOG, SUBJECTS } from "../data/experiments";
import LearningJourney from "../components/LearningJourney";

const formatSubject = (subject) => subject.charAt(0).toUpperCase() + subject.slice(1);



const getBadgeList = (completedIds) => {
  const completedCount = completedIds.size;
  const badges = [
    {
      title: "Beginner Scientist",
      unlocked: completedCount >= 1,
      detail: "Complete your first experiment",
    },
    {
      title: "Physics Explorer",
      unlocked: EXPERIMENT_CATALOG.filter((exp) => exp.subject === "physics").every((exp) =>
        completedIds.has(exp.id)
      ),
      detail: "Complete every Physics experiment",
    },
    {
      title: "Chemistry Master",
      unlocked: EXPERIMENT_CATALOG.filter((exp) => exp.subject === "chemistry").every((exp) =>
        completedIds.has(exp.id)
      ),
      detail: "Complete every Chemistry experiment",
    },
    {
      title: "Biology Expert",
      unlocked: EXPERIMENT_CATALOG.filter((exp) => exp.subject === "biology").every((exp) =>
        completedIds.has(exp.id)
      ),
      detail: "Complete every Biology experiment",
    },
  ];

  return badges;
};

const ProgressBar = ({ value, tone = "blue" }) => (
  <div className="tracker-bar" aria-hidden="true">
    <span className={`tracker-bar-fill ${tone}`} style={{ width: `${value}%` }} />
  </div>
);

const ProgressDashboard = () => {
  const { records, recommendations, completedIds, loading, usingLocalFallback, markExperimentComplete } = useProgress();
  const { completedQuizzes, quizAttempts } = useGamification();
  const [weekAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [activeTab, setActiveTab] = useState("overview");
  const completedCount = completedIds.size;
  const totalCount = EXPERIMENT_CATALOG.length;
  const overallPercent = Math.round((completedCount / totalCount) * 100);
  const completedRecords = records.filter((record) => record.completed);
  const pendingExperiments = EXPERIMENT_CATALOG.filter((exp) => !completedIds.has(exp.id));
  const badges = getBadgeList(completedIds);
  const latestAttemptsByExperiment = new Map();
  quizAttempts.forEach((attempt) => {
    if (!latestAttemptsByExperiment.has(attempt.experiment_id)) {
      latestAttemptsByExperiment.set(attempt.experiment_id, attempt);
    }
  });
  const quizAccuracy = quizAttempts.length
    ? Math.round(
        (quizAttempts.reduce((sum, attempt) => sum + attempt.score / attempt.total_questions, 0) /
          quizAttempts.length) *
          100
      )
    : 0;

  const weeklyCount = completedRecords.filter((record) => {
    if (!record.completion_date) return false;
    const completedAt = new Date(record.completion_date).getTime();
    return completedAt >= weekAgo;
  }).length;

  if (loading) {
    return (
      <main className="progress-dashboard">
        <div className="tracker-loading">Loading experiment progress...</div>
      </main>
    );
  }

  return (
    <main className="progress-dashboard fade-in">
      <BackButton label="Back to Lab" />

      <section className="tracker-hero mb-8">
        <div>
          <p className="tracker-kicker">Student progress tracker</p>
          <h1>Experiment Dashboard</h1>
          <p>
            Track completed labs, revisit your learning history, and visualize your scientific journey.
          </p>
        </div>
        <div className="tracker-score">
          <span>{overallPercent}%</span>
          <small>{completedCount} of {totalCount} complete</small>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-8 pb-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`text-md font-bold px-5 py-2.5 rounded-xl transition-all ${
            activeTab === "overview" 
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          Statistical Overview
        </button>
        <button
          onClick={() => setActiveTab("journey")}
          className={`text-md font-bold px-5 py-2.5 rounded-xl transition-all ${
            activeTab === "journey" 
              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" 
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          Learning Journey
        </button>
      </div>

      {activeTab === "overview" ? (
        <>

      {usingLocalFallback && (
        <div className="tracker-notice">
          Progress is being saved in this browser until the backend is available.
        </div>
      )}

      <section className="tracker-stats-grid">
        <article>
          <span>Completed</span>
          <strong>{completedCount}</strong>
          <small>Experiments finished</small>
        </article>
        <article>
          <span>Pending</span>
          <strong>{pendingExperiments.length}</strong>
          <small>Ready to explore</small>
        </article>
        <article>
          <span>This Week</span>
          <strong>{weeklyCount}</strong>
          <small>Recent completions</small>
        </article>
        <article>
          <span>Quiz Accuracy</span>
          <strong>{quizAccuracy}%</strong>
          <small>{quizAttempts.length} attempts saved</small>
        </article>
      </section>

      {recommendations && recommendations.length > 0 && (
        <section className="tracker-panel fade-in" style={{ marginBottom: "24px", borderLeft: "4px solid #8b5cf6" }}>
          <div className="tracker-panel-heading">
            <h2>Suggested Experiments</h2>
            <span>Personalized for you</span>
          </div>
          <div className="tracker-recommendations">
            {recommendations.map((rec) => {
              const expData = EXPERIMENT_CATALOG.find(e => e.id === rec.experiment_id);
              return (
                <Link to={expData?.link || "/"} key={rec.experiment_id} className="rec-card">
                  <span className="rec-badge">{rec.reason}</span>
                  <span className={`rec-difficulty difficulty-${rec.difficulty}`}>{rec.difficulty}</span>
                  <h3 className="rec-title">{rec.title}</h3>
                  <p className="rec-desc">{rec.description}</p>
                  <span className="rec-action">Start Experiment &rarr;</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="tracker-panel">
        <div className="tracker-panel-heading">
          <h2>Subject Progress</h2>
          <span>{overallPercent}% overall</span>
        </div>
        <div className="tracker-subjects">
          {SUBJECTS.map((subject) => {
            const subjectExperiments = EXPERIMENT_CATALOG.filter((exp) => exp.subject === subject);
            const subjectCompleted = subjectExperiments.filter((exp) => completedIds.has(exp.id)).length;
            const subjectPercent = Math.round((subjectCompleted / subjectExperiments.length) * 100);
            const subjectQuizScores = subjectExperiments
              .map((exp) => completedQuizzes[exp.id])
              .filter((score) => score !== undefined);
            const subjectQuizAccuracy = subjectQuizScores.length
              ? Math.round(
                  (subjectQuizScores.reduce((sum, score) => sum + score, 0) /
                    (subjectQuizScores.length * 5)) *
                    100
                )
              : 0;

            return (
              <div className="tracker-subject-row" key={subject}>
                <div>
                  <strong>{formatSubject(subject)}</strong>
                  <span>{subjectCompleted}/{subjectExperiments.length} completed - {subjectQuizAccuracy}% quiz accuracy</span>
                </div>
                <ProgressBar value={subjectPercent} tone={subject} />
                <b>{subjectPercent}%</b>
              </div>
            );
          })}
        </div>
      </section>

      <section className="tracker-grid-two">
        <div className="tracker-panel">
          <div className="tracker-panel-heading">
            <h2>Pending Experiments</h2>
            <span>{pendingExperiments.length} left</span>
          </div>
          <div className="tracker-list">
            {pendingExperiments.length === 0 ? (
              <p className="tracker-empty">Every experiment is complete. Excellent momentum.</p>
            ) : (
              pendingExperiments.map((experiment) => (
                <div className="tracker-list-item" key={experiment.id}>
                  <div>
                    <strong>{experiment.title}</strong>
                    <span>{formatSubject(experiment.subject)}</span>
                  </div>
                  <button type="button" onClick={() => markExperimentComplete(experiment)}>
                    Complete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="tracker-panel">
          <div className="tracker-panel-heading">
            <h2>Achievements</h2>
            <span>{badges.filter((badge) => badge.unlocked).length}/{badges.length}</span>
          </div>
          <div className="tracker-badges">
            {badges.map((badge) => (
              <div className={badge.unlocked ? "tracker-badge unlocked" : "tracker-badge"} key={badge.title}>
                <strong>{badge.title}</strong>
                <span>{badge.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
        </>
      ) : (
        <LearningJourney />
      )}
    </main>
  );
};

export default ProgressDashboard;
