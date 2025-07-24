import React, { useState, useEffect } from "react";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";
import { normalizeAppName } from "../utils/normalize";
import { getTimeWeight } from "../utils/weights";
import WordCloud from "../components/WordCloud";

// 1. Import Firestore functions
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";

// --- Utility functions ---

// Helper to randomize last digit for double-digit numbers
function randomizeLastDigit(num) {
  if (num < 10) return num;
  const base = Math.floor(num / 10) * 10;
  return base + Math.floor(Math.random() * 10);
}

// Helper to add ±2% randomness to avgPay
function randomizeAvgPay(avgPay) {
  const factor = 1 + (Math.random() * 0.04 - 0.02);
  return Math.round((avgPay * factor) * 100) / 100;
}

// --- Fallback Data Generation ---

// Deep clone and apply multiplier/randomness for new vehicle types
function cloneVehicleData(baseArr, ordersMultiplier, avgPayMultiplier) {
  return baseArr.map((item) => ({
    app: normalizeAppName(item.app),
    orders: randomizeLastDigit(Math.round(item.orders * ordersMultiplier)),
    avgPay: randomizeAvgPay(item.avgPay * avgPayMultiplier),
  }));
}

// --- REPLACE fallbackData const with new baseFallbackData ---
const baseFallbackData = {
  hour: {
    bike: [
      { app: "Just Eat", orders: 6, avgPay: 14.5 },
      { app: "Uber Eats", orders: 6, avgPay: 13.8 },
      { app: "Deliveroo", orders: 6, avgPay: 13.1 },
      { app: "Foodhub", orders: 4, avgPay: 10.8 },
      { app: "Zapp", orders: 3, avgPay: 9.5 },
    ],
    car: [
      { app: "Just Eat", orders: 4, avgPay: 13.2 },
      { app: "Uber Eats", orders: 4, avgPay: 12.9 },
      { app: "Deliveroo", orders: 4, avgPay: 12.5 },
      { app: "Foodhub", orders: 2, avgPay: 9.5 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
    scooter: [
      { app: "Just Eat", orders: 5, avgPay: 11.2 },
      { app: "Uber Eats", orders: 5, avgPay: 10.9 },
      { app: "Deliveroo", orders: 0, avgPay: 0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
    foot: [
      { app: "Just Eat", orders: 2, avgPay: 4.2 },
      { app: "Uber Eats", orders: 2, avgPay: 4.1 },
      { app: "Deliveroo", orders: 0, avgPay: 0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
  },
  day: {
    bike: [
      { app: "Just Eat", orders: 30, avgPay: 105.5 },
      { app: "Uber Eats", orders: 28, avgPay: 102.0 },
      { app: "Deliveroo", orders: 25, avgPay: 95.0 },
      { app: "Foodhub", orders: 15, avgPay: 72.0 },
      { app: "Zapp", orders: 12, avgPay: 62.0 },
    ],
    car: [
      { app: "Just Eat", orders: 20, avgPay: 98.0 },
      { app: "Uber Eats", orders: 20, avgPay: 96.0 },
      { app: "Deliveroo", orders: 18, avgPay: 92.0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
    scooter: [
      { app: "Just Eat", orders: 15, avgPay: 85.0 },
      { app: "Uber Eats", orders: 15, avgPay: 82.0 },
      { app: "Deliveroo", orders: 0, avgPay: 0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
    foot: [
      { app: "Just Eat", orders: 5, avgPay: 30.0 },
      { app: "Uber Eats", orders: 5, avgPay: 28.0 },
      { app: "Deliveroo", orders: 0, avgPay: 0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
  },
  week: {
    bike: [
      { app: "Just Eat", orders: 200, avgPay: 680.0 },
      { app: "Uber Eats", orders: 190, avgPay: 650.0 },
      { app: "Deliveroo", orders: 180, avgPay: 620.0 },
      { app: "Foodhub", orders: 100, avgPay: 390.0 },
      { app: "Zapp", orders: 80, avgPay: 320.0 },
    ],
    car: [
      { app: "Just Eat", orders: 150, avgPay: 630.0 },
      { app: "Uber Eats", orders: 140, avgPay: 610.0 },
      { app: "Deliveroo", orders: 130, avgPay: 590.0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
    scooter: [
      { app: "Just Eat", orders: 120, avgPay: 530.0 },
      { app: "Uber Eats", orders: 110, avgPay: 510.0 },
      { app: "Deliveroo", orders: 0, avgPay: 0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
    foot: [
      { app: "Just Eat", orders: 30, avgPay: 120.0 },
      { app: "Uber Eats", orders: 30, avgPay: 114.0 },
      { app: "Deliveroo", orders: 0, avgPay: 0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
  },
  month: {
    bike: [
      { app: "Just Eat", orders: 850, avgPay: 2600.0 },
      { app: "Uber Eats", orders: 800, avgPay: 2500.0 },
      { app: "Deliveroo", orders: 750, avgPay: 2400.0 },
      { app: "Foodhub", orders: 400, avgPay: 1500.0 },
      { app: "Zapp", orders: 300, avgPay: 1100.0 },
    ],
    car: [
      { app: "Just Eat", orders: 600, avgPay: 2200.0 },
      { app: "Uber Eats", orders: 550, avgPay: 2100.0 },
      { app: "Deliveroo", orders: 500, avgPay: 2000.0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
    scooter: [
      { app: "Just Eat", orders: 500, avgPay: 1900.0 },
      { app: "Uber Eats", orders: 450, avgPay: 1800.0 },
      { app: "Deliveroo", orders: 0, avgPay: 0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
    foot: [
      { app: "Just Eat", orders: 100, avgPay: 380.0 },
      { app: "Uber Eats", orders: 90, avgPay: 350.0 },
      { app: "Deliveroo", orders: 0, avgPay: 0 },
      { app: "Foodhub", orders: 0, avgPay: 0 },
      { app: "Zapp", orders: 0, avgPay: 0 },
    ],
  },
};

// --- Generate fallbackData with new vehicle types ---
const fallbackData = {};
for (const timeframe of Object.keys(baseFallbackData)) {
  fallbackData[timeframe] = {};

  // 1. bike
  fallbackData[timeframe].bike = cloneVehicleData(baseFallbackData[timeframe].bike, 1, 1);

  // 2. ebike (bike * 1.1)
  fallbackData[timeframe].ebike = cloneVehicleData(baseFallbackData[timeframe].bike, 1.1, 1.1);

  // 3. scooter
  fallbackData[timeframe].scooter = cloneVehicleData(baseFallbackData[timeframe].scooter, 1, 1);

  // 4. foot
  fallbackData[timeframe].foot = cloneVehicleData(baseFallbackData[timeframe].foot, 1, 1);

  // 5. motor (car * 0.98)
  fallbackData[timeframe].motor = cloneVehicleData(baseFallbackData[timeframe].car, 0.98, 0.98);

  // 6. car
  fallbackData[timeframe].car = cloneVehicleData(baseFallbackData[timeframe].car, 1, 1);
}

// --- Fallback generator for new apps ---
// Prevents copying from fallback entries that have orders = 0 and avgPay = 0
// Vehicle support per app (keys must be lowercase + normalized)
const appVehicleSupport = {
  "stuart": ["bike", "scooter", "ebike"],
  "glovo": ["bike", "foot"],
  "dishpatch": ["car"], // Formerly "Gorillas"
  "gophr": ["bike", "car", "ebike"], // Formerly "Fancy Delivery"
  "snappy shopper": ["car", "motor"], // Formerly "Snappi"
};

// ✅ Generates fallback only for supported vehicles
export function generateFallbackForNewApp(appName) {
  const normalized = normalizeAppName(appName).toLowerCase(); // Ensure safe key match
  const supportedVehicles = appVehicleSupport[normalized];

  if (!supportedVehicles) {
    console.warn(`No vehicle mapping found for "${normalized}", skipping fallback generation.`);
    return;
  }

  for (const timeframe of Object.keys(fallbackData)) {
    for (const vehicle of supportedVehicles) {
      const arr = fallbackData[timeframe][vehicle];
      if (!arr) continue; // Skip if vehicle doesn't exist in fallbackData for this timeframe

      // 🧪 Use the last real data point as base
      const nonZero = [...arr].reverse().find(
        item => item.orders > 0 && item.avgPay > 0
      );

      let newEntry;
      if (nonZero) {
        newEntry = {
          app: normalized,
          orders: randomizeLastDigit(Math.round(nonZero.orders * 0.97)),
          avgPay: randomizeAvgPay(nonZero.avgPay * 0.97),
        };
      } else {
        newEntry = {
          app: normalized,
          orders: 0,
          avgPay: 0,
        };
      }

      arr.push(newEntry);
    }
  }
}

// Only use approved/renamed apps here:
generateFallbackForNewApp("Stuart");
generateFallbackForNewApp("Glovo");
generateFallbackForNewApp("Dishpatch"); // was "Gorillas"
generateFallbackForNewApp("Gophr");     // was "Fancy Delivery"
generateFallbackForNewApp("Snappy Shopper"); // was "Snappi"

// --- Vehicle options for dropdowns/filters ---
export const vehicleOptions = [
  { value: "bike", label: "Bike" },
  { value: "ebike", label: "Ebike" },
  { value: "scooter", label: "Scooter" },
  { value: "foot", label: "Foot" },
  { value: "motor", label: "Motor" },
  { value: "car", label: "Car" },
];

const timeOptions = [
  { value: "hour", label: "Last Hour" },
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

export default function Homepage() {
  const [timeframe, setTimeframe] = useState("hour");
  const [vehicle, setVehicle] = useState("bike");
  const [user, setUser] = useState(null);

  const timeWeight = getTimeWeight(timeframe);

  // Helper: get earliest valid timestamp for current timeframe
  function getEarliestTimestamp(tf) {
    const now = new Date();
    switch (tf) {
      case "hour":
        return new Date(now.getTime() - 60 * 60 * 1000);
      case "day":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case "week": {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
        return new Date(now.getFullYear(), now.getMonth(), diff);
      }
      case "month":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(0);
    }
  }

  // 2. Add state for submitted Firestore data
  const [submittedData, setSubmittedData] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // 3. Fetch user submissions for selected timeframe + vehicle
  useEffect(() => {
    async function fetchSubmittedData() {
      try {
        const q = query(
          collection(db, "submissions"),
          where("timeframe", "==", timeframe),
          where("vehicle", "==", vehicle)
        );
        const snapshot = await getDocs(q);
        const docs = [];
        const earliest = getEarliestTimestamp(timeframe);

        snapshot.forEach(doc => {
          const data = doc.data();
          // Only include if createdAt exists and is within timeframe
          if (
            data.createdAt &&
            typeof data.createdAt.toDate === "function" &&
            data.createdAt.toDate() >= earliest
          ) {
            docs.push(data);
          }
        });
        setSubmittedData(docs);
      } catch (err) {
        setSubmittedData([]); // fallback if error
      }
    }
    fetchSubmittedData();
  }, [timeframe, vehicle]);

  // Prepare fallback data for current timeframe/vehicle
  const fallbackArr = fallbackData[timeframe][vehicle].map(item => ({
    ...item,
    app: normalizeAppName(item.app),
    orders:
      timeframe === "hour"
        ? Math.round(item.orders * timeWeight)
        : item.orders, // No timeWeight for day/week/month
    avgPay: item.avgPay,
  }));

  // Build a map of valid submitted data by normalized app name
  const submittedMap = {};
  for (const item of submittedData) {
    const app = normalizeAppName(item.app);
    if (!submittedMap[app]) {
      submittedMap[app] = { app, orders: 0, earnings: 0 };
    }
    submittedMap[app].orders += Number(item.orders) || 0;
    submittedMap[app].earnings += Number(item.earnings) || 0;
  }

  // Merge: always start with fallback, replace with valid submission if present
  const merged = fallbackArr.map(fb => {
    if (submittedMap[fb.app]) {
      return {
        app: fb.app,
        orders:
          timeframe === "hour"
            ? Math.round(submittedMap[fb.app].orders * timeWeight)
            : submittedMap[fb.app].orders, // No timeWeight for day/week/month
        earnings:
          timeframe === "hour"
            ? Math.round(submittedMap[fb.app].earnings * timeWeight * 100) / 100
            : submittedMap[fb.app].earnings,
        avgPay: fb.avgPay, // Always fallback avgPay
      };
    }
    return fb;
  });

  // Add any submitted apps not present in fallback
  for (const app in submittedMap) {
    if (!merged.find(row => row.app === app)) {
      merged.push({
        app,
        orders:
          timeframe === "hour"
            ? Math.round(submittedMap[app].orders * timeWeight)
            : submittedMap[app].orders,
        earnings:
          timeframe === "hour"
            ? Math.round(submittedMap[app].earnings * timeWeight * 100) / 100
            : submittedMap[app].earnings,
        avgPay: 0, // No fallback avgPay, so set to 0
      });
    }
  }

  // Sort merged data by avgPay (descending), optionally hide apps with 0 data
  const data = merged
    .filter(item => item.orders > 0 && item.avgPay > 0)
    .sort((a, b) => (b.avgPay || 0) - (a.avgPay || 0));

  // Custom style for select in dark mode
  const isDarkMode = typeof window !== "undefined" && document.body.classList.contains("darkmode");
  const selectStyle = {
    backgroundColor: isDarkMode ? "#222" : "#fff",
    color: isDarkMode ? "#2563eb" : "#222", // blue text in dark mode, dark text in light
    border: isDarkMode ? "1px solid #555" : undefined,
  };

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto mt-4 px-4 gap-6">
      {/* Left info panel */}
      <div className="md:w-[48%] bg-white rounded-lg shadow p-8 flex flex-col justify-start">
        <h2 className="text-xl font-bold mb-2">DeliveryStats, For London Couriers</h2>
        <p className="text-gray-700 mb-4">
          This dashboard was built for Couriers in London to help you optimise your time and maximise your orders.
          See which apps are busiest and what you can expect to earn, based on real and community-submitted data.
        </p>
        <WordCloud data={data} />
        <div className="flex flex-col gap-1 mt-4">
          <a
            href="/submit"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
          >
            Submit Your Orders
          </a>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
          >
            Login / Sign Up
          </a>
          {user && (
            <button
              onClick={() => signOut(auth)}
              className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-center"
            >
              Logout
            </button>
          )}
        </div>
      </div>
      {/* Main data panel */}
      <div className="md:w-2/3">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div>
            <label className="block mb-1 font-semibold">Timeframe</label>
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              className="border rounded p-2 w-full"
              style={selectStyle}
            >
              {timeOptions.map(opt => (
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
            <label className="block mb-1 font-semibold">Vehicle Type</label>
            <select
              value={vehicle}
              onChange={e => setVehicle(e.target.value)}
              className="border rounded p-2 w-full"
              style={selectStyle}
            >
              {vehicleOptions.map(opt => (
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
        </div>
        <h1 className="text-2xl font-bold text-center mb-4">
          Top Delivery Apps in London ({timeOptions.find(t => t.value === timeframe).label})
        </h1>
        <table className="w-full text-left border-collapse bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-4">App</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Avg Pay (£)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-4 font-semibold">{item.app}</td>
                <td className="p-4">{item.orders}</td>
                <td className="p-4">£{(item.avgPay || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Suggest App Prompt */}
        {!user && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Missing an app?{" "}
            <a href="/login?redirect=/submit-app" className="text-blue-600 underline">
              Log in to suggest it
            </a>
          </p>
        )}
        {user && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Missing an app?{" "}
            <a href="/submit-app" className="text-blue-600 underline">
              Submit it here
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
