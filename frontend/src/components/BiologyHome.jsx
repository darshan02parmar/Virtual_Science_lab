import ExperimentCard from "./ExperimentCard";
import { EXPERIMENT_CATALOG } from "../data/experiments";

const BiologyHome = () => {
  const biologyExperiments = EXPERIMENT_CATALOG.filter(
    (experiment) => experiment.subject === "biology"
  );

  return (
    <div>
      <h1>Biology Virtual Lab</h1>
      <p>Explore interactive 3D biology experiments</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {biologyExperiments.map((exp) => (
          <ExperimentCard
            key={exp.id}
            id={exp.id}
            title={exp.title}
            description={exp.description}
            subject={exp.subject}
            link={exp.link}
          />
        ))}
      </div>
    </div>
  );
};

export default BiologyHome;
