import React, { useState, useEffect } from "react";
import { db, auth } from "../utils/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { normalizeAppName } from "../utils/normalize";

// Known app options
const appOptions = [
  "Uber Eats",
  "Just Eat",
  "Deliveroo",
  "Foodhub",
  "Zapp",
  "Stuart",
  "Glovo",
  "Dishpatch",
  "Gophr",
  "Snappy Shopper",
];

// Vehicle options (match Homepage vehicleOptions)
const vehicleOptions = [
  { value: "bike", label: "Bike" },
  { value: "ebike", label: "Ebike" },
  { value: "scooter", label: "Scooter" },
  { value: "foot", label: "Foot" },
  { value: "motor", label: "Motor" },
  { value: "car", label: "Car" },
];

// Timeframe options
const timeframeOptions = [
  { value: "hour", label: "Last Hour" },
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

export default function ReportForm() {
  const [appName, setAppName] = useState(appOptions[0]);
  const [orders, setOrders] = useState("");
  const [vehicleType, setVehicleType] = useState(vehicleOptions[0].value);
  const [hoursWorked, setHoursWorked] = useState("");
  const [earnings, setEarnings] = useState("");
  const [timeframe, setTimeframe] = useState("hour");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation: block unrealistic spam data
    if (!appName || !orders || !hoursWorked || !earnings || !timeframe) {
      setMessage("Please fill in all required fields.");
      return;
    }
    if (
      Number(orders) < 1 ||
      Number(orders) > 1000 ||
      Number(hoursWorked) < 1 ||
      Number(hoursWorked) > 24 ||
      Number(earnings) < 0 ||
      Number(earnings) > 10000 ||
      Number(earnings) / Number(orders) > 500 // avgPay too high
    ) {
      setMessage("Please enter realistic values for orders, hours, and earnings.");
      return;
    }

    setLoading(true);
    setMessage("");

    // Limit 1 submission per timeframe per user
    try {
      const userId = auth.currentUser?.uid || null;
      const q = query(
        collection(db, "submissions"),
        where("userId", "==", userId),
        where("timeframe", "==", timeframe)
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        setMessage("You have already submitted a report for this timeframe.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "submissions"), {
        app: normalizeAppName(appName),
        orders: Number(orders),
        vehicle: vehicleType,
        hoursWorked: Number(hoursWorked),
        earnings: Number(earnings),
        timeframe,
        userId,
        userEmail: auth.currentUser?.email || null,
        createdAt: serverTimestamp(),
        verified: false,
        avgPay: Number(earnings) / Number(orders) || 0,
      });

      setMessage("Report submitted successfully!");
      setAppName(appOptions[0]);
      setOrders("");
      setVehicleType(vehicleOptions[0].value);
      setHoursWorked("");
      setEarnings("");
      setTimeframe("hour");
    } catch (error) {
      setMessage("Error submitting report: " + error.message);
    }

    setLoading(false);
  }

  // Custom style for select in dark mode
  const isDarkMode = typeof window !== "undefined" && document.body.classList.contains("darkmode");
  const selectStyle = {
    backgroundColor: isDarkMode ? "#222" : "#fff",
    color: isDarkMode ? "#2563eb" : "#222", // blue text in dark mode, dark text in light
    border: isDarkMode ? "1px solid #555" : undefined,
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Submit Order Report</h2>
      {message && <p className="mb-4 text-center">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Delivery App Name *</label>
          <select
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            required
            className="w-full p-2 rounded"
            disabled={loading}
            style={selectStyle}
          >
            {appOptions.map((app) => (
              <option
                key={app}
                value={app}
                style={{
                  backgroundColor: isDarkMode ? "#222" : "#fff",
                  color: isDarkMode ? "#2563eb" : "#222", // blue text in dark mode
                }}
              >
                {app}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Vehicle Type *</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            required
            className="w-full p-2 rounded"
            disabled={loading}
            style={selectStyle}
          >
            {vehicleOptions.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{
                  backgroundColor: isDarkMode ? "#222" : "#fff",
                  color: isDarkMode ? "#2563eb" : "#222",
                }}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Timeframe *</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            required
            className="w-full p-2 rounded"
            disabled={loading}
            style={selectStyle}
          >
            {timeframeOptions.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{
                  backgroundColor: isDarkMode ? "#222" : "#fff",
                  color: isDarkMode ? "#2563eb" : "#222",
                }}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Number of Orders *</label>
          <input
            type="number"
            value={orders}
            onChange={(e) => setOrders(e.target.value)}
            required
            min="1"
            max="1000"
            className="w-full border p-2 rounded"
            disabled={loading}
            placeholder="e.g., 25"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Hours Worked *</label>
          <input
            type="number"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value)}
            required
            min="1"
            max="24"
            step="1"
            className="w-full border p-2 rounded"
            disabled={loading}
            placeholder="e.g., 4"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Total Earnings (£) *</label>
          <input
            type="number"
            value={earnings}
            onChange={(e) => setEarnings(e.target.value)}
            required
            min="0"
            max="10000"
            step="0.01"
            className="w-full border p-2 rounded"
            disabled={loading}
            placeholder="e.g., 120.50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
