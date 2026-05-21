import { useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useProgress } from "../context/ProgressContext";
import { EXPERIMENT_CATALOG, SUBJECTS } from "../data/experiments";

const formatSubject = (subject) => subject.charAt(0).toUpperCase() + subject.slice(1);

const formatDate = (date) => {
  if (!date) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

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
  const { records, completedIds, loading, usingLocalFallback, markExperimentComplete } = useProgress();
  const [weekAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);
  const completedCount = completedIds.size;
  const totalCount = EXPERIMENT_CATALOG.length;
  const overallPercent = Math.round((completedCount / totalCount) * 100);
  const completedRecords = records.filter((record) => record.completed);
  const pendingExperiments = EXPERIMENT_CATALOG.filter((exp) => !completedIds.has(exp.id));
  const badges = getBadgeList(completedIds);

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

      <section className="tracker-hero">
        <div>
          <p className="tracker-kicker">Student progress tracker</p>
          <h1>Experiment Dashboard</h1>
          <p>
            Track completed labs, revisit your learning history, and see which subject needs
            your next experiment.
          </p>
        </div>
        <div className="tracker-score">
          <span>{overallPercent}%</span>
          <small>{completedCount} of {totalCount} complete</small>
        </div>
      </section>

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
          <span>Badges</span>
          <strong>{badges.filter((badge) => badge.unlocked).length}</strong>
          <small>Achievements unlocked</small>
        </article>
      </section>

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

            return (
              <div className="tracker-subject-row" key={subject}>
                <div>
                  <strong>{formatSubject(subject)}</strong>
                  <span>{subjectCompleted}/{subjectExperiments.length} completed</span>
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

      <section className="tracker-panel">
        <div className="tracker-panel-heading">
          <h2>Experiment History</h2>
          <span>{completedRecords.length} records</span>
        </div>
        <div className="tracker-history">
          {completedRecords.length === 0 ? (
            <p className="tracker-empty">Mark an experiment complete to begin your learning journey.</p>
          ) : (
            completedRecords.map((record) => {
              const experiment = EXPERIMENT_CATALOG.find((item) => item.id === record.experiment_id);
              return (
                <Link
                  className="tracker-history-item"
                  key={record.experiment_id}
                  to={experiment?.link || "/"}
                >
                  <div>
                    <strong>{record.title}</strong>
                    <span>{formatSubject(record.subject)} - Completed {formatDate(record.completion_date)}</span>
                  </div>
                  <small>Revisit</small>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};

export default ProgressDashboard;
