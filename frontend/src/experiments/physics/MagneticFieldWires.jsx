import physicsData from "../../data/physics.json";
import InstructionPanel from "../../components/InstructionPanel";
import BackButton from "../../components/BackButton";
import Quiz from "../../components/Quiz";
import ExperimentNotesPanel from "../../components/ExperimentNotesPanel";

import SimulationViewer from "../../components/SimulationViewer";

const MagneticFieldWires = () => {

  const experiment = physicsData.experiments.find(
    (exp) => exp.id === "magnetic-field-wires"
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

      <Quiz experimentId="magnetic-field-wires" subject="physics" />
      <div style={{ marginTop: "24px" }}>
        <ExperimentNotesPanel experimentId="magnetic-field-wires" />
      </div>
    </div>
  );
};

export default MagneticFieldWires;
