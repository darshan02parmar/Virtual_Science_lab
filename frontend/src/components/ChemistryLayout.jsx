import { Outlet } from "react-router-dom";
import BackButton from "./BackButton";

const ChemistryLayout = () => {
  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <BackButton label="Back" />
      <Outlet />
    </div>
  );
};

export default ChemistryLayout;