import { Outlet } from "react-router-dom";
import BackButton from "./BackButton";

const MathematicsLayout = () => {
  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <BackButton label="Back" />
      <Outlet />
    </div>
  );
};

export default MathematicsLayout;
