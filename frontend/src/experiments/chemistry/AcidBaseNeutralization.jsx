import React from "react";

const AcidBaseNeutralization = () => {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
      >
        ← Back to Chemistry
      </button>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Acid–Base Neutralization Reaction
      </h1>

      <p className="text-gray-600 mb-6">
        Simulation of a neutralization reaction between hydrochloric acid and
        sodium hydroxide.
      </p>

      {/* Placeholder for 3D model/video */}
      <div className="mb-8 rounded-xl border bg-white shadow-md overflow-hidden">
        <div className="h-[400px] flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
          3D Model / Experiment Video Placeholder
          <br />
          (Will add tomorrow)
        </div>
      </div>

      {/* Experiment Instructions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Experiment Instructions</h2>

        {/* Aim */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Aim</h3>
          <p className="text-gray-700">
            To observe the neutralization reaction between hydrochloric acid
            (HCl) and sodium hydroxide (NaOH), resulting in the formation of
            salt and water.
          </p>
        </section>

        {/* Theory */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Theory</h3>
          <p className="text-gray-700 mb-3">
            A neutralization reaction occurs when an acid reacts with a base to
            produce salt and water.
          </p>

          <p className="text-gray-700 mb-3">
            Hydrochloric acid (HCl) is a strong acid, while sodium hydroxide
            (NaOH) is a strong base.
          </p>

          <p className="text-gray-700 mb-3">
            When mixed, hydrogen ions (H⁺) combine with hydroxide ions (OH⁻) to
            form water (H₂O), while sodium (Na⁺) and chloride (Cl⁻) ions form
            sodium chloride (NaCl).
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="font-semibold text-blue-900">
              Chemical Equation:
            </p>
            <p className="text-lg mt-2">
              HCl + NaOH → NaCl + H₂O
            </p>
          </div>

          <p className="text-gray-700 mt-3">
            This reaction is exothermic, meaning it releases heat.
          </p>
        </section>

        {/* Procedure */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Procedure</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Take a beaker containing dilute hydrochloric acid (HCl).</li>
            <li>Add a few drops of phenolphthalein indicator.</li>
            <li>Slowly add sodium hydroxide (NaOH) solution.</li>
            <li>Stir the mixture gently.</li>
            <li>Observe the color change and temperature change.</li>
            <li>Continue until the solution reaches neutralization.</li>
          </ol>
        </section>

        {/* Observation */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Observation</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>The indicator changes color during the reaction.</li>
            <li>The temperature increases slightly.</li>
            <li>A neutral solution is formed.</li>
          </ul>
        </section>

        {/* Result */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Result</h3>
          <p className="text-gray-700">
            Hydrochloric acid reacts with sodium hydroxide to form sodium
            chloride and water, confirming a successful neutralization reaction.
          </p>
        </section>

        {/* Precautions */}
        <section>
          <h3 className="text-xl font-semibold mb-2">Precautions</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Wear protective gloves and safety goggles.</li>
            <li>Handle acid and base carefully.</li>
            <li>Add solutions slowly to avoid splashing.</li>
            <li>Stir gently during mixing.</li>
            <li>Dispose of chemicals safely.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AcidBaseNeutralization;