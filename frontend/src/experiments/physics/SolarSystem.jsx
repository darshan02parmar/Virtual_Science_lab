import physicsData from "../../data/physics.json";
import InstructionPanel from "../../components/InstructionPanel";
import BackButton from "../../components/BackButton";
import Quiz from "../../components/Quiz";
import ExperimentNotesPanel from "../../components/ExperimentNotesPanel";

const SolarSystem = () => {

  const experiment = physicsData.experiments.find(
    (exp) => exp.id === "solar-system"
  );

  if (!experiment) {
    return <p>Experiment not found</p>;
  }

  return (
    <div>
      <BackButton label="Back to Physics" />

      <h1>{experiment.title}</h1>
      <p>{experiment.description}</p>

      <div style={{ position: "relative", marginTop: "16px" }}>

        <iframe
          title={experiment.title}
          src={`${experiment.modelUrl}?ui_infos=0&ui_controls=0&ui_stop=0&ui_help=0`}
          width="100%"
          height="500"
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          style={{ borderRadius: "12px" }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "48px",
            background:
              document.body.getAttribute("data-theme") === "dark"
                ? "#020617"
                : "#ffffff",
            zIndex: 2,
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        />

      </div>

      <InstructionPanel
        aim={experiment.aim}
        theory={experiment.theory}
        procedure={experiment.procedure}
        observation={experiment.observation}
        result={experiment.result}
        precautions={experiment.precautions}
      />

      <Quiz experimentId="solar-system" subject="physics" />

      <div style={{ marginTop: "24px" }}>
        <ExperimentNotesPanel experimentId="solar-system" />
      </div>

    </div>
  );
};

export default SolarSystem;