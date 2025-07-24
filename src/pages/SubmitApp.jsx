import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../utils/firebase";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";
import { normalizeAppName } from "../utils/normalize";

export default function SubmitApp() {
  const [appName, setAppName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = auth.currentUser;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!appName.trim()) {
      setError("App name is required.");
      return;
    }
    setLoading(true);
    try {
      const normalizedApp = normalizeAppName(appName.trim());
      // Only save suggestion to Firestore, do NOT generate fallback
      await addDoc(collection(db, "appSuggestions"), {
        app: normalizedApp,
        submittedBy: user?.uid || null,
        timestamp: serverTimestamp(),
        notes: notes.trim(),
      });
      setSuccess(true);
      setAppName("");
      setNotes("");
      setTimeout(() => navigate("/"), 2000);
      alert("Thanks! We're reviewing your suggestion.");
    } catch (err) {
      setError("Failed to submit: " + err.message);
    }
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Suggest a Delivery App</h2>
        <p className="mb-4">You must be logged in to suggest a new app.</p>
        <a href="/login?redirect=/submit-app" className="text-blue-600 underline">
          Login here
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Suggest a Delivery App</h2>
      {success ? (
        <div className="text-green-700 text-center font-semibold">
          Thank you! Your suggestion has been submitted.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">App Name *</label>
            <input
              type="text"
              value={appName}
              onChange={e => setAppName(e.target.value)}
              required
              className="w-full border p-2 rounded"
              disabled={loading}
              placeholder="e.g., Gorillas"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border p-2 rounded"
              disabled={loading}
              placeholder="Any comments or info?"
              rows={3}
            />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Suggestion"}
          </button>
        </form>
      )}
    </div>
  );
}