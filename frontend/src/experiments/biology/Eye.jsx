import biologyData from "../../data/biology.json";
import InstructionPanel from "../../components/InstructionPanel";
import BackButton from "../../components/BackButton";
import Quiz from "../../components/Quiz";
import ExperimentNotesPanel from "../../components/ExperimentNotesPanel";

import SimulationViewer from "../../components/SimulationViewer";

const Eye = () => {

  // Find eye experiment from JSON
  const experiment = biologyData.experiments.find(
    (exp) => exp.id === "eye"
  );

  if (!experiment) {
    return <p>Experiment not found</p>;
  }

  return (
    <div>
      <BackButton label="Back to Biology" />

      <h1>{experiment.title}</h1>
      <p>{experiment.description}</p>

      {/* 3D Model */}
      <SimulationViewer
        title={experiment.title}
        src={`${experiment.modelUrl}?ui_infos=0&ui_controls=0&ui_stop=0&ui_help=0`}
      />


      {/* Instructions */}
      <InstructionPanel
        aim={experiment.aim}
        theory={experiment.theory}
        procedure={experiment.procedure}
        observation={experiment.observation}
        result={experiment.result}
        precautions={experiment.precautions}
      />

      <Quiz experimentId="eye" subject="biology" />
      <div style={{ marginTop: "24px" }}>
        <ExperimentNotesPanel experimentId="eye" />
      </div>
    </div>
  );
};

export default Eye;

