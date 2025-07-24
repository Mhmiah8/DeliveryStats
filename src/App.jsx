import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import Homepage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import ReportForm from "./pages/ReportForm";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CommunityPage from "./pages/CommunityPage";
import AdminPage from "./pages/AdminPage"; // Add this import
import SubmitApp from "./pages/SubmitApp";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/submit" element={<ReportForm />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/submit-app" element={<SubmitApp />} /> {/* Add this line */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
