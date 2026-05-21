import { useEffect, useState } from "react";
import ExperimentCard from "./ExperimentCard";

const ChemistryHome = () => {
  const [experiments, setExperiments] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/chemistry/experiments")
      .then((res) => res.json())
      .then((data) => setExperiments(data.experiments))
      .catch(() => console.error("Backend not connected"));
  }, []);

  return (
    <div>
      <h1>Chemistry Virtual Lab</h1>
      <p>Explore interactive chemistry experiments</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {experiments.map((exp) => (
          <ExperimentCard
            key={exp.slug}
            id={exp.slug}
            title={exp.title}
            description={exp.description}
            subject="chemistry"
            link={`/chemistry/${exp.slug}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ChemistryHome;
