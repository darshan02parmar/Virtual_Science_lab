import { EXPERIMENT_CATALOG } from "../data/experiments";
import SubjectDashboard from "./SubjectDashboard";

const MathematicsHome = () => {
  const mathExperiments = EXPERIMENT_CATALOG.filter(
    (experiment) => experiment.subject === "mathematics"
  );

  return (
    <SubjectDashboard
      subject="mathematics"
      title="Mathematics Virtual Lab"
      description="Explore interactive visualizations of geometry, probability, and algebra. Strengthen your problem‑solving skills with hands‑on experiments."
      experiments={mathExperiments}
      colorTheme={{
        bg: "bg-green-500",
        text: "text-green-500",
        border: "border-green-500/20",
        hoverBorder: "hover:border-green-500/50",
        gradientLight: "from-green-50 to-emerald-50",
        gradientDark: "from-green-950/40 to-emerald-950/40"
      }}
    />
  );
};

export default MathematicsHome;
