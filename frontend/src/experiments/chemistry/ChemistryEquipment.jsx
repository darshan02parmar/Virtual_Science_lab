import chemistryData from "../../data/chemistry.json";
import InstructionPanel from "../../components/InstructionPanel";
import BackButton from "../../components/BackButton";
import Quiz from "../../components/Quiz";
import ExperimentNotesPanel from "../../components/ExperimentNotesPanel";

import SimulationViewer from "../../components/SimulationViewer";

const ChemistryEquipment = () => {

  const experiment = chemistryData.experiments.find(
    (exp) => exp.id === "chemistry-equipment"
  );

  if (!experiment) {
    return <p>Experiment not found</p>;
  }

  return (
    <div>
      <BackButton label="Back to Chemistry" />

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

      <Quiz experimentId="chemistry-equipment" subject="chemistry" />
      <div style={{ marginTop: "24px" }}>
        <ExperimentNotesPanel experimentId="chemistry-equipment" />
      </div>
    </div>
  );
};

export default ChemistryEquipment;
