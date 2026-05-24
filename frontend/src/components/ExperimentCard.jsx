import { Link } from "react-router-dom";
import { useProgress } from "../context/ProgressContext";

const getSubjectIcon = (subject) => {
  const normalizedSubject = subject?.trim().toLowerCase();

  if (normalizedSubject === "biology") return "Bio";
  if (normalizedSubject === "chemistry") return "Chem";
  if (normalizedSubject === "physics") return "Phys";

  return "Lab";
};

const getTypeClass = (subject) => {
  const normalizedSubject = subject?.trim().toLowerCase();

  if (normalizedSubject === "biology") return "biology";
  if (normalizedSubject === "chemistry") return "chemistry";
  if (normalizedSubject === "physics") return "physics";

  return "";
};

const ExperimentCard = ({ id, title, description, link, subject, difficulty }) => {
  const { completedIds, markExperimentComplete } = useProgress();
  const isCompleted = completedIds.has(id);

  const handleComplete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    markExperimentComplete({ id, title, subject });
  };

  return (
    <Link to={link} className="card-link">
      <div className={`experiment-card card fade-in progress-card ${getTypeClass(subject)}`}>
        <div className="progress-card-header">
          <div>
            <div className="card-icon">{getSubjectIcon(subject)}</div>
            <h3>{title}</h3>
            {difficulty && (
              <span className={`rec-difficulty difficulty-${difficulty}`} style={{ marginLeft: 0, marginTop: "8px" }}>
                {difficulty}
              </span>
            )}
          </div>
          {isCompleted && <span className="progress-status-pill">Completed</span>}
        </div>
        <p>{description}</p>
        <button
          className={`progress-complete-button ${isCompleted ? "is-complete" : ""}`}
          disabled={isCompleted}
          onClick={handleComplete}
          type="button"
        >
          {isCompleted ? "Completed" : "Mark Complete"}
        </button>
      </div>
    </Link>
  );
};

export default ExperimentCard;
