// ElectronicsHome.jsx

import { EXPERIMENT_CATALOG } from "../data/experiments";
import SubjectDashboard from "./SubjectDashboard";

const ElectronicsHome = () => {
  const electronicsExperiments = EXPERIMENT_CATALOG.filter(
    (experiment) => experiment.subject === "electronics"
  );

  return (
    <SubjectDashboard
      subject="electronics"
      title="Electronics Virtual Lab"
      description="Design and test circuits, semiconductors, sensors, and embedded systems in a virtual electronics workspace."
      experiments={electronicsExperiments}
      colorTheme={{
        bg: "bg-yellow-500",
        text: "text-yellow-500",
        border: "border-yellow-500/20",
        hoverBorder: "hover:border-yellow-500/50",
        gradientLight: "from-yellow-50 to-amber-50",
        gradientDark: "from-yellow-950/40 to-amber-950/40",
      }}
    />
  );
};

export default ElectronicsHome;