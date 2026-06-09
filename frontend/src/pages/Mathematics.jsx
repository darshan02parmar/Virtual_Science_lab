import { Routes, Route } from "react-router-dom";
import MathematicsLayout from "../components/MathematicsLayout";
import MathematicsHome from "../components/MathematicsHome";

import GeometryShapes from "../experiments/mathematics/GeometryShapes";
import ProbabilitySimulator from "../experiments/mathematics/ProbabilitySimulator";

const Mathematics = () => {
  return (
    <Routes>
      <Route element={<MathematicsLayout />}>
        <Route index element={<MathematicsHome />} />
        <Route path="geometry-shapes" element={<GeometryShapes />} />
        <Route path="probability-simulator" element={<ProbabilitySimulator />} />
      </Route>
    </Routes>
  );
};

export default Mathematics;