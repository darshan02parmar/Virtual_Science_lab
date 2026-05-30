import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BadgeNotification from "./components/BadgeNotification";
import SyncManager from "./components/SyncManager";
import ParticipantPresence from "./components/collaboration/ParticipantPresence";

/* Main Pages */
import Home from "./pages/Home";
import Biology from "./pages/Biology";
import Chemistry from "./pages/Chemistry";
import Physics from "./pages/Physics";
import Profile from "./pages/Profile";
import ProgressDashboard from "./pages/ProgressDashboard";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import ReportHistory from "./pages/ReportHistory";
import MyProgress from "./pages/MyProgress";
import NotebookDashboard from "./pages/NotebookDashboard";
import NotebookEditor from "./pages/NotebookEditor";
import TeamSessionLobby from "./pages/TeamSessionLobby";
import CareerExplorer from "./pages/CareerExplorer";
import NotebookDashboard from "./pages/NotebookDashboard";
import NotebookEditor from "./pages/NotebookEditor";

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <ParticipantPresence />
      <BadgeNotification />
      <SyncManager />
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Science Subjects */}
        <Route path="/biology/*" element={<Biology />} />
        <Route path="/chemistry/*" element={<Chemistry />} />
        <Route path="/physics/*" element={<Physics />} />

        {/* User Pages */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<ProgressDashboard />} />
        <Route path="/explore" element={<KnowledgeGraph />} />
        <Route path="/reports" element={<ReportHistory />} />
        <Route path="/my-progress" element={<MyProgress />} />
        <Route path="/notebook" element={<NotebookDashboard />} />
        <Route path="/notebook/:experimentId" element={<NotebookEditor />} />
        <Route path="/collaborate" element={<TeamSessionLobby />} />
        <Route path="/careers" element={<CareerExplorer />} />
        <Route path="/notebook" element={<NotebookDashboard />} />
        <Route path="/notebook/:experimentId" element={<NotebookEditor />} />
      </Routes>
    </>
  );
};

export default AppRouter;