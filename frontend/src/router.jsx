import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import BadgeNotification from "./components/BadgeNotification";
import SyncManager from "./components/SyncManager";

/* Main Pages */
import Home from "./pages/Home";
import Biology from "./pages/Biology";
import Chemistry from "./pages/Chemistry";
import Physics from "./pages/Physics";
import Mathematics from "./pages/Mathematics";
import ComputerScience from "./pages/ComputerScience";
import EnvironmentalScience from "./pages/EnvironmentalScience";
import Astronomy from "./pages/Astronomy";
import Robotics from "./pages/Robotics";
import Electronics from "./pages/Electronics";
import ArtificialIntelligence from "./pages/ArtificialIntelligence";
import Geography from "./pages/Geography";
import Psychology from "./pages/Psychology";

import Profile from "./pages/Profile";
import ProgressDashboard from "./pages/ProgressDashboard";
import ReportHistory from "./pages/ReportHistory";
import MyProgress from "./pages/MyProgress";

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <BadgeNotification />
      <SyncManager />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Science Subjects */}
        <Route path="/biology/*" element={<Biology />} />
        <Route path="/chemistry/*" element={<Chemistry />} />
        <Route path="/physics/*" element={<Physics />} />
        <Route path="/mathematics/*" element={<Mathematics />} />
        <Route
          path="/computer-science/*"
          element={<ComputerScience />}
        />
        <Route
          path="/environmental-science/*"
          element={<EnvironmentalScience />}
        />

        {/* Advanced Subjects */}
        <Route path="/astronomy/*" element={<Astronomy />} />
        <Route path="/robotics/*" element={<Robotics />} />
        <Route path="/electronics/*" element={<Electronics />} />
        <Route
          path="/artificial-intelligence/*"
          element={<ArtificialIntelligence />}
        />

        {/* Social & Earth Sciences */}
        <Route path="/geography/*" element={<Geography />} />
        <Route path="/psychology/*" element={<Psychology />} />

        {/* User Pages */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<ProgressDashboard />} />
        <Route path="/reports" element={<ReportHistory />} />
        <Route path="/my-progress" element={<MyProgress />} />
      </Routes>
    </>
  );
};

export default AppRouter;