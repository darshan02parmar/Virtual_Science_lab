import { Routes, Route } from "react-router-dom";
import PhysicsLayout from "../components/PhysicsLayout";
import PhysicsHome from "../components/PhysicsHome";

import VelocityAcceleration from "../experiments/physics/VelocityAcceleration";
import MagneticFieldWires from "../experiments/physics/MagneticFieldWires";
import ThumbRule from "../experiments/physics/ThumbRule";
import MagneticFieldDirection from "../experiments/physics/MagneticFieldDirection";
import SolarSystem from "../experiments/physics/SolarSystem";
const Physics = () => {
  return (
    <Routes>
      <Route element={<PhysicsLayout />}>
        <Route index element={<PhysicsHome />} />
        <Route
          path="velocity-acceleration"
          element={<VelocityAcceleration />}
        />
        <Route
          path="magnetic-field-wires"
          element={<MagneticFieldWires />}
        />
        <Route path="thumb-rule" element={<ThumbRule />} />
        <Route
          path="magnetic-field-direction"
          element={<MagneticFieldDirection />}
        />
        <Route
        path="solar-system"
        element={<SolarSystem />}
        />
      </Route>
      
    </Routes>
  );
};

export default Physics;
