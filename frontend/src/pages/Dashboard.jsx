import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ApplicationForm from "../components/ApplicationForm";
import WelcomeMessage from "../components/WelcomeMessage";
import StatusSummary from "../components/StatusSummary";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [deleteAppId, setDeleteAppId] = useState(null);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get("/applications");
      setApps(data);
    } catch (err) {
      toast.error("Failed to load applications");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editApp) {
        await api.put(`/applications/${editApp._id}`, formData);
        toast.success("Application updated");
      } else {
        await api.post("/applications", formData);
        toast.success("Application added");
      }
      setShowForm(false);
      setEditApp(null);
      fetchApplications();
    } catch (err) {
      toast.error("Failed to submit application");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/applications/${deleteAppId}`);
      toast.success("Application deleted");
      setDeleteAppId(null);
      fetchApplications();
    } catch (err) {
      toast.error("Failed to delete application");
    }
  };

  const handleEdit = (app) => {
    setEditApp(app);
    setShowForm(true);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-100 text-blue-700";
      case "interview":
        return "bg-yellow-100 text-yellow-800";
      case "offer":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredApps =
    filteredStatus === "All"
      ? apps
      : apps.filter((app) => app.status === filteredStatus);

  if (!user) return <WelcomeMessage />;

  return (
    <div className="min-h-screen bg-blue-50 p-6 animate-fadeIn ">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6 ml-6">
        {/* Left side: Header with Icon + User Name */}
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">Your Applications</h2>
        </div>

        {/* Right side: Add Application button */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setEditApp(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg 
                       shadow-md hover:shadow-lg transition-all duration-300 
                       transform hover:scale-105 active:scale-95"
          >
            + Add Application
          </button>
        </div>
      </div>

      {/* Filters and Status Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
        {/* Filter Dropdown */}
        <div className="mb-4 sm:mb-0 ml-6">
          <label className="block mb-2 text-sm font-medium">Filter by Status</label>
          <select
            value={filteredStatus}
            onChange={(e) => setFilteredStatus(e.target.value)}
            className="border rounded-lg p-3 w-full sm:w-56"
          >
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Status Count Summary */}
        <StatusSummary apps={filteredApps} />
      </div>

      {/* Application Form */}
      {showForm && (
        <div className="bg-white p-6 mb-10 rounded-xl shadow-lg">
          <ApplicationForm
            onSubmit={handleSubmit}
            initialData={editApp}
            onCancel={() => {
              setShowForm(false);
              setEditApp(null);
            }}
          />
        </div>
      )}

      {/* Applications List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6">
        {filteredApps.map((app) => (
          <div
            key={app._id}
            className="bg-white border rounded-2xl shadow-md p-6 
                       hover:shadow-xl hover:scale-[1.02] transition-all duration-300 
                       animate-slideUp"
          >
            {/* Company & Position */}
            <h3 className="text-xl font-semibold text-gray-800 mb-1">{app.company}</h3>
            <p className="text-gray-600 mb-2">{app.position}</p>

            {/* Status Badge */}
            <span
              className={`inline-block mt-3 text-base font-semibold px-5 py-2 rounded-full ${getStatusColor(
                app.status
              )}`}
            >
              {app.status}
            </span>

            {/* Applied Date + Resume */}
            <div className="mt-4 text-sm text-gray-500 space-y-2">
              <p>Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
              {app.resumeLink && (
                <a
                  href={app.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Resume
                </a>
              )}
            </div>

            {/* Notes */}
            {app.notes && (
              <p className="italic text-gray-700 mt-3 line-clamp-2">{app.notes}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-5">
              {/* Edit Button */}
              <button
                onClick={() => handleEdit(app)}
                className="px-4 py-2 rounded-lg text-blue-600 border border-blue-600
                           hover:bg-blue-600 hover:text-white transition-all duration-300
                           transform hover:scale-105 active:scale-95"
              >
                ✏️ Edit
              </button>

              {/* Delete Button */}
              <button
                onClick={() => setDeleteAppId(app._id)}
                className="px-4 py-2 rounded-lg text-red-500 border border-red-500
                           hover:bg-red-500 hover:text-white transition-all duration-300
                           transform hover:scale-105 active:scale-95"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <p className="text-gray-500 text-center col-span-full mt-6">
            No applications found for this status.
          </p>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteAppId}
        onCancel={() => setDeleteAppId(null)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this application?"
      />
    </div>
  );
}
