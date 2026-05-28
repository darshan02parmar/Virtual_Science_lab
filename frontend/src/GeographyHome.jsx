// GeographyHome.jsx

import { EXPERIMENT_CATALOG } from "./data/experiments";
import SubjectDashboard from "./SubjectDashboard";

const GeographyHome = () => {
  const geographyExperiments = EXPERIMENT_CATALOG.filter(
    (experiment) => experiment.subject === "geography"
  );

  return (
    <SubjectDashboard
      subject="geography"
      title="Geography Virtual Lab"
      description="Study maps, climate systems, terrains, and natural resources through interactive geographical simulations."
      experiments={geographyExperiments}
      colorTheme={{
        bg: "bg-cyan-500",
        text: "text-cyan-500",
        border: "border-cyan-500/20",
        hoverBorder: "hover:border-cyan-500/50",
        gradientLight: "from-cyan-50 to-sky-50",
        gradientDark: "from-cyan-950/40 to-sky-950/40",
      }}
    />
  );
};

export default GeographyHome;