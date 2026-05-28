// PsychologyHome.jsx

import { EXPERIMENT_CATALOG } from "../data/experiments";
import SubjectDashboard from "./SubjectDashboard";

const PsychologyHome = () => {
  const psychologyExperiments = EXPERIMENT_CATALOG.filter(
    (experiment) => experiment.subject === "psychology"
  );

  return (
    <SubjectDashboard
      subject="psychology"
      title="Psychology Virtual Lab"
      description="Understand human behavior, cognition, memory, and emotions through interactive psychology experiments."
      experiments={psychologyExperiments}
      colorTheme={{
        bg: "bg-rose-500",
        text: "text-rose-500",
        border: "border-rose-500/20",
        hoverBorder: "hover:border-rose-500/50",
        gradientLight: "from-rose-50 to-pink-50",
        gradientDark: "from-rose-950/40 to-pink-950/40",
      }}
    />
  );
};

export default PsychologyHome;