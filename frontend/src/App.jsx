// src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Ask from "./components/Ask";

import Home from "./pages/Home";
import Biology from "./pages/Biology";
import Chemistry from "./pages/Chemistry";
import Physics from "./pages/Physics";
import FAQ from "./pages/FAQ";
import Policy from "./pages/Policy";
import Mathematics from "./pages/Mathematics";

function App() {
  return (
    <BrowserRouter>
      {/* Main Layout */}
      <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        
        {/* Navbar */}
        <Navbar />

        {/* Page Routes */}
        <main>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Subject Pages */}
            <Route path="/biology/*" element={<Biology />} />
            <Route path="/chemistry/*" element={<Chemistry />} />
            <Route path="/physics/*" element={<Physics />} />
            <Route path="/mathematics/*" element={<Mathematics />} />
            {/* FAQ */}
            <Route path="/faq" element={<FAQ />} />

            {/* Policy */}
            <Route path="/policy" element={<Policy />} />

            {/* 404 Not Found */}
            <Route
              path="*"
              element={
                <div className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
                  <div className="rounded-3xl border border-indigo-400/20 bg-white/5 p-10 shadow-2xl backdrop-blur-xl">
                    <h1 className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-7xl font-black text-transparent">
                      404
                    </h1>

                    <h2 className="mt-4 text-3xl font-bold">
                      Page Not Found
                    </h2>

                    <p className="mt-4 max-w-md text-slate-500 dark:text-slate-300">
                      The page you are trying to access does not exist or may
                      have been moved.
                    </p>

                    <a
                      href="/"
                      className="mt-8 inline-flex items-center rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-3 font-semibold text-slate-900 transition duration-300 hover:scale-105"
                    >
                      Return Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Floating AI Assistant */}
        <Ask />
      </div>
    </BrowserRouter>
  );
}

export default App;