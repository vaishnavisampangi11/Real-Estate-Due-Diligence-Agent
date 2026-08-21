import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  FileText,
  Clock,
  Eye,
  Edit3,
  ShieldCheck,
  Building2,
  X,
  Save,
} from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { getLiveSavedProperties } from "../../services/liveStore";
import { getMyReports } from "../../services/reportService";
import { showToast } from "../../utils/swal";

function BuyerProfileSummary() {
  const navigate = useNavigate();

  const getStoredUser = () => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const parsed = JSON.parse(saved);
        const name = parsed.fullName || parsed.name || (parsed.firstName ? `${parsed.firstName} ${parsed.lastName || ""}`.trim() : "User");
        const email = parsed.email || "";
        const role = parsed.role || "Buyer";
        return { name, email, role };
      }
    } catch (e) {}
    return {
      name: "User",
      email: "",
      role: "Buyer",
    };
  };

  const [user, setUser] = useState(getStoredUser);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [reportsCount, setReportsCount] = useState(0);

  const savedCount = (getLiveSavedProperties() || []).length;

  useEffect(() => {
    getMyReports()
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setReportsCount(raw.length);
      })
      .catch(() => {
        setReportsCount(0);
      });
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = { ...user, name: editName, email: editEmail };
    setUser(updated);
    try {
      const existing = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...existing, ...updated }));
      window.dispatchEvent(new Event("user_profile_updated"));
    } catch (err) {}
    setEditModalOpen(false);
    showToast("Profile details updated", "success");
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#334155] shadow-xl bg-white dark:bg-[#1E293B] font-mono text-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-[#334155]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail size={12} /> {user.email}
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            setEditName(user.name);
            setEditEmail(user.email);
            setEditModalOpen(true);
          }}
          variant="outline"
          size="xs"
          icon={Edit3}
        >
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Role</span>
          <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-sm block mt-1">
            {user.role}
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Due Diligence Reports</span>
          <strong className="text-slate-900 dark:text-white font-extrabold text-sm block mt-1">
            {reportsCount}
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Saved Watchlist</span>
          <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm block mt-1">
            {savedCount}
          </strong>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditModalOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#334155]">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Edit Profile Details</h3>
                <button onClick={() => setEditModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    disabled
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-500 font-bold cursor-not-allowed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#334155]">
                  <Button onClick={() => setEditModalOpen(false)} variant="secondary" size="xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="xs" icon={Save}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BuyerProfileSummary;
