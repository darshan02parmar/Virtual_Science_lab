// AstronomyHome.jsx

import { EXPERIMENT_CATALOG } from "../data/experiments";
import SubjectDashboard from "./SubjectDashboard";

const AstronomyHome = () => {
  const astronomyExperiments = EXPERIMENT_CATALOG.filter(
    (experiment) => experiment.subject === "astronomy"
  );

  return (
    <SubjectDashboard
      subject="astronomy"
      title="Astronomy Virtual Lab"
      description="Explore planets, stars, galaxies, black holes, and cosmic phenomena through immersive space simulations."
      experiments={astronomyExperiments}
      colorTheme={{
        bg: "bg-indigo-500",
        text: "text-indigo-500",
        border: "border-indigo-500/20",
        hoverBorder: "hover:border-indigo-500/50",
        gradientLight: "from-indigo-50 to-slate-50",
        gradientDark: "from-indigo-950/40 to-slate-950/40",
      }}
    />
  );
};

export default AstronomyHome;