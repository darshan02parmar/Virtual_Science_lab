import { Link } from "react-router-dom";
import { useProgress } from "../context/ProgressContext";

const ExperimentCard = ({ id, title, description, link, subject }) => {
  const { completedIds, markExperimentComplete } = useProgress();
  const isCompleted = completedIds.has(id);

  const handleComplete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    markExperimentComplete({ id, title, subject });
  };

  return (
    <Link to={link} style={{ textDecoration: "none" }}>
      <div className="experiment-card card fade-in progress-card">
        <div className="progress-card-header">
          <h3>{title}</h3>
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
