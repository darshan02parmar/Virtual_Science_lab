import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BadgeNotification from "./components/BadgeNotification";
import SyncManager from "./components/SyncManager";

import Home from "./pages/Home";
import Biology from "./pages/Biology";
import Chemistry from "./pages/Chemistry";
import Physics from "./pages/Physics";
import Profile from "./pages/Profile";
import ProgressDashboard from "./pages/ProgressDashboard";

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <BadgeNotification />
      <SyncManager />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/biology/*" element={<Biology />} />
        <Route path="/chemistry/*" element={<Chemistry />} />
        <Route path="/physics/*" element={<Physics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<ProgressDashboard />} />
      </Routes>
    </>
  );
};

export default AppRouter;
