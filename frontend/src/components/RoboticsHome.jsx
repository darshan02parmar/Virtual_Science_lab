// RoboticsHome.jsx

import { EXPERIMENT_CATALOG } from "../data/experiments";
import SubjectDashboard from "./SubjectDashboard";

const RoboticsHome = () => {
  const roboticsExperiments = EXPERIMENT_CATALOG.filter(
    (experiment) => experiment.subject === "robotics"
  );

  return (
    <SubjectDashboard
      subject="robotics"
      title="Robotics Virtual Lab"
      description="Build, program, and test intelligent robotic systems with interactive automation and AI simulations."
      experiments={roboticsExperiments}
      colorTheme={{
        bg: "bg-zinc-500",
        text: "text-zinc-500",
        border: "border-zinc-500/20",
        hoverBorder: "hover:border-zinc-500/50",
        gradientLight: "from-zinc-50 to-gray-50",
        gradientDark: "from-zinc-950/40 to-gray-950/40",
      }}
    />
  );
};

export default RoboticsHome;