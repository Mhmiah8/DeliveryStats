import React, { useEffect, useState, useMemo } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { vehicleOptions } from "./Homepage"; // Import vehicleOptions
import { normalizeAppName } from "../utils/normalize";
const VEHICLE_TYPES = vehicleOptions.map((v) => v.value);

export default function AdminPage() {
  // State for reports, users, loading, errors, and UI toggles
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showUsers, setShowUsers] = useState(false);

  // Filter states
  const [filterVerified, setFilterVerified] = useState("all");
  const [filterApp, setFilterApp] = useState("all");
  const [filterVehicle, setFilterVehicle] = useState("all");

  // Fetch all reports on mount
  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      setError("");
      try {
        // CHANGED: "reports" -> "submissions"
        const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          // Normalize appName for all reports
          data.push({ id: docSnap.id, ...d, appName: normalizeAppName(d.appName) });
        });
        setReports(data);
      } catch (err) {
        setError("Failed to fetch reports: " + err.message);
      }
      setLoading(false);
    }
    fetchReports();
  }, []);

  // Aggregate orders per app for bar chart
  const barChartData = useMemo(() => {
    const agg = {};
    reports.forEach((r) => {
      if (!r.appName) return;
      const norm = normalizeAppName(r.appName);
      agg[norm] = (agg[norm] || 0) + (Number(r.orders) || 0);
    });
    return Object.entries(agg).map(([appName, orders]) => ({ appName, orders }));
  }, [reports]);

  // Get unique app names for filter dropdown
  const appNames = useMemo(() => {
    const set = new Set();
    reports.forEach((r) => r.appName && set.add(normalizeAppName(r.appName)));
    return Array.from(set);
  }, [reports]);

  // Filtered reports for table
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterVerified === "verified" && !r.verified) return false;
      if (filterVerified === "unverified" && r.verified) return false;
      if (filterApp !== "all" && normalizeAppName(r.appName) !== filterApp) return false;
      if (filterVehicle !== "all" && r.vehicleType !== filterVehicle) return false;
      return true;
    });
  }, [reports, filterVerified, filterApp, filterVehicle]);

  // Users list for toggle view
  const users = useMemo(() => {
    const userMap = {};
    reports.forEach((r) => {
      if (r.userEmail) {
        if (!userMap[r.userEmail]) {
          userMap[r.userEmail] = {
            userEmail: r.userEmail,
            userId: r.userId || "",
            count: 1,
          };
        } else {
          userMap[r.userEmail].count += 1;
        }
      }
    });
    return Object.values(userMap);
  }, [reports]);

  // Summary counts
  const total = reports.length;
  const verified = reports.filter((r) => r.verified).length;
  const unverified = total - verified;

  // Update verified status
  async function handleVerify(id, current) {
    setUpdatingId(id);
    setError("");
    try {
      // CHANGED: "reports" -> "submissions"
      await updateDoc(doc(db, "submissions", id), { verified: !current });
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, verified: !current } : r
        )
      );
    } catch (err) {
      setError("Failed to update verification: " + err.message);
    }
    setUpdatingId(null);
  }

  // Delete report
  async function handleDelete(id) {
    if (!window.confirm("Delete this report?")) return;
    setDeletingId(id);
    setError("");
    try {
      // CHANGED: "reports" -> "submissions"
      await deleteDoc(doc(db, "submissions", id));
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError("Failed to delete report: " + err.message);
    }
    setDeletingId(null);
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>

      {/* Stats Summary with Bar Chart */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="font-semibold">Total Reports:</span> {total}{" "}
            <span className="ml-4 font-semibold text-green-700">Verified:</span> {verified}{" "}
            <span className="ml-4 font-semibold text-yellow-700">Unverified:</span> {unverified}
          </div>
        </div>
        <div className="mt-6 bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Orders per App</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="appName" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Toggle button for Reports/Users */}
      <div className="mb-6 flex justify-end">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={() => setShowUsers((v) => !v)}
        >
          {showUsers ? "Show Reports" : "Show Users"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 text-red-600 font-semibold">{error}</div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-10 text-lg">Loading...</div>
      ) : showUsers ? (
        // Users List View
        <div className="bg-white rounded shadow p-4 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-4">Users Who Submitted Reports</h2>
          <ul>
            {users.length === 0 && (
              <li className="text-gray-500">No users found.</li>
            )}
            {users.map((u) => (
              <li key={u.userEmail} className="py-2 border-b last:border-b-0 flex justify-between">
                <span>{u.userEmail}</span>
                <span className="text-gray-500">Reports: {u.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // Reports Table View
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Verified Status</label>
              <select
                value={filterVerified}
                onChange={e => setFilterVerified(e.target.value)}
                className="border rounded p-2"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Delivery App</label>
              <select
                value={filterApp}
                onChange={e => setFilterApp(e.target.value)}
                className="border rounded p-2"
              >
                <option value="all">All</option>
                {appNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Vehicle Type</label>
              <select
                value={filterVehicle}
                onChange={e => setFilterVehicle(e.target.value)}
                className="border rounded p-2"
              >
                <option value="all">All</option>
                {vehicleOptions.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3">Delivery App Name</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Vehicle Type</th>
                  <th className="p-3">Hours Worked</th>
                  <th className="p-3">User Email</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Verified</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{normalizeAppName(r.appName)}</td>
                    <td className="p-3">{r.orders}</td>
                    <td className="p-3">{r.vehicleType}</td>
                    <td className="p-3">{r.hoursWorked}</td>
                    <td className="p-3">{r.userEmail || <span className="text-gray-400">N/A</span>}</td>
                    <td className="p-3">
                      {r.createdAt?.toDate
                        ? r.createdAt.toDate().toLocaleString()
                        : <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="p-3">
                      <span className={r.verified ? "text-green-700 font-semibold" : "text-yellow-700 font-semibold"}>
                        {r.verified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleVerify(r.id, r.verified)}
                        disabled={updatingId === r.id}
                        className={`px-3 py-1 rounded text-white ${r.verified ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"} disabled:opacity-50`}
                      >
                        {updatingId === r.id
                          ? "Updating..."
                          : r.verified
                          ? "Unverify"
                          : "Verify"}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                      >
                        {deletingId === r.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// Export normalizeAppName for use in other files if needed
export { normalizeAppName };