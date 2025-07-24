import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../utils/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    async function checkAdmin() {
      if (user) {
        // Check Firestore adminUsers collection for this user's email as doc ID
        const adminDoc = await getDoc(doc(db, "adminUsers", user.email));
        if (!ignore) setIsAdmin(adminDoc.exists());
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
    return () => { ignore = true; };
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle("darkmode", darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-lg text-blue-700 hover:text-blue-900">
            Home
          </Link>
          <Link to="/submit" className="text-gray-700 hover:text-blue-700">
            Submit Report
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-700">
            About
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-700">
            Contact
          </Link>
          <Link to="/community" className="text-gray-700 hover:text-blue-700">
            Tips
          </Link>
          {user && (
            <Link to="/submit-app" className="text-sm text-blue-600 hover:underline ml-4">
              Suggest App
            </Link>
          )}
          {user && isAdmin && (
            <Link to="/admin" className="text-gray-700 hover:text-blue-700">
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {!user && !loading && (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-700">
                Login
              </Link>
              <Link to="/signup" className="text-gray-700 hover:text-blue-700">
                Signup
              </Link>
            </>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          )}
          <button
            onClick={() => setDarkMode(dm => !dm)}
            className="px-3 py-2 rounded border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            aria-label="Toggle dark mode"
            style={{ minWidth: 40 }}
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
}