import physicsData from "../../data/physics.json";
import InstructionPanel from "../../components/InstructionPanel";
import BackButton from "../../components/BackButton";
import Quiz from "../../components/Quiz";
import ExperimentNotesPanel from "../../components/ExperimentNotesPanel";

import SimulationViewer from "../../components/SimulationViewer";

const ThumbRule = () => {

  const experiment = physicsData.experiments.find(
    (exp) => exp.id === "thumb-rule"
  );

  if (!experiment) {
    return <p>Experiment not found</p>;
  }

  return (
    <div>
      <BackButton label="Back to Physics" />

      <h1>{experiment.title}</h1>
      <p>{experiment.description}</p>

      <SimulationViewer
        title={experiment.title}
        src={`${experiment.modelUrl}?ui_infos=0&ui_controls=0&ui_stop=0&ui_help=0`}
      />


      <InstructionPanel
        aim={experiment.aim}
        theory={experiment.theory}
        procedure={experiment.procedure}
        observation={experiment.observation}
        result={experiment.result}
        precautions={experiment.precautions}
      />

      <Quiz experimentId="thumb-rule" subject="physics" />
      <div style={{ marginTop: "24px" }}>
        <ExperimentNotesPanel experimentId="thumb-rule" />
      </div>
    </div>
  );
};

export default ThumbRule;
