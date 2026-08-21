import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Key,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  X,
  Check,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { showErrorAlert, showSuccessAlert, showToast, showConfirmDialog } from "../utils/swal";
import {
  getAllUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../services/userService";

// Role mapping helper
const formatRole = (roleStr) => {
  if (!roleStr) return "Buyer";
  const r = roleStr.toUpperCase();
  if (r === "ADMINISTRATOR" || r === "ADMIN") return "Administrator";
  if (r === "REAL_ESTATE_AGENT" || r === "AGENT") return "Real Estate Agent";
  if (r === "LEGAL_REVIEWER" || r === "LEGAL") return "Legal Reviewer";
  if (r === "FINANCIAL_INSTITUTION" || r === "FINANCIAL") return "Financial Institution";
  if (r === "BUYER") return "Buyer";
  return roleStr.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const toBackendRole = (roleStr) => {
  if (!roleStr) return "BUYER";
  const r = roleStr.toUpperCase();
  if (r.includes("ADMIN")) return "ADMINISTRATOR";
  if (r.includes("AGENT")) return "REAL_ESTATE_AGENT";
  if (r.includes("LEGAL")) return "LEGAL_REVIEWER";
  if (r.includes("FINANCIAL")) return "FINANCIAL_INSTITUTION";
  return "BUYER";
};

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("userId");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal Controls
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [newSelectedRole, setNewSelectedRole] = useState("Buyer");

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Buyer",
    phone: "",
    password: "",
  });

  const fetchUsers = useCallback(async (isManual = false) => {
    try {
      if (isManual) setSyncing(true);
      else setLoading(true);
      setError(null);

      const res = await getAllUsers();
      const list = Array.isArray(res) ? res : res?.data || [];

      const formatted = list.map((u) => {
        const uId = u.userId || u.id;
        const fn = u.firstName || "";
        const ln = u.lastName || "";
        const fullName = u.fullName || `${fn} ${ln}`.trim() || `User #${uId}`;
        const roleLabel = formatRole(u.role?.roleName || u.role);
        const isActive = u.isActive !== false;

        return {
          userId: uId,
          id: `USR-${uId}`,
          firstName: fn,
          lastName: ln,
          name: fullName,
          email: u.email || "Not available",
          phone: u.phone || "Not available",
          role: roleLabel,
          status: isActive ? "Active" : "Inactive",
          isActive: isActive,
          createdDate: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "Not available",
          lastLogin: u.lastLogin
            ? new Date(u.lastLogin).toLocaleString("en-GB")
            : "Not available",
          organization:
            roleLabel === "Administrator"
              ? "Platform Administration"
              : roleLabel === "Financial Institution"
              ? "Institutional Credit Division"
              : roleLabel === "Legal Reviewer"
              ? "Title Audit & Due Diligence"
              : roleLabel === "Real Estate Agent"
              ? "Realty Prime Brokerage"
              : "Registered Buyer",
        };
      });

      setUsers(formatted);
      const nowStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSyncTime(nowStr);

      if (isManual) {
        showToast("User registry refreshed from PostgreSQL database", "success");
      }
    } catch (err) {
      console.error("Failed to load user management records:", err);
      setError("Unable to load users. Please check backend connectivity.");
      setUsers([]);
      if (isManual) {
        showToast("Failed to sync user records", "error");
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q) ||
          String(u.userId).includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.organization.toLowerCase().includes(q);

        const matchesRole = selectedRole === "ALL" || u.role === selectedRole;
        const matchesStatus = selectedStatus === "ALL" || u.status === selectedStatus;

        return matchesQuery && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortBy] ?? "";
        let valB = b[sortBy] ?? "";
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [users, searchQuery, selectedRole, selectedStatus, sortBy, sortOrder]);

  // Pagination Math
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Action: Toggle Account Status in PostgreSQL
  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      await toggleUserStatus(user.userId);
      showToast(`Account status updated for ${user.name} to ${newStatus}`, "success");
      fetchUsers(false);
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showErrorAlert("Status Update Failed", "Could not change user account status in database.");
    }
  };

  // Action: Change User Role in PostgreSQL
  const handleSaveRoleChange = async () => {
    if (!roleChangeUser) return;
    try {
      await updateUser(roleChangeUser.userId, {
        firstName: roleChangeUser.firstName,
        lastName: roleChangeUser.lastName,
        email: roleChangeUser.email,
        phone: roleChangeUser.phone === "Not available" ? "" : roleChangeUser.phone,
        role: toBackendRole(newSelectedRole),
      });
      showSuccessAlert("Role Updated", `User role for ${roleChangeUser.name} changed to ${newSelectedRole}.`);
      setRoleChangeUser(null);
      fetchUsers(false);
    } catch (err) {
      console.error("Failed to update role:", err);
      showErrorAlert("Role Update Failed", "Could not update user role in database.");
    }
  };

  // Action: Delete User with Confirmation
  const handleDeleteUser = async (user) => {
    const confirmed = await showConfirmDialog(
      "Delete User Account?",
      `Are you sure you want to permanently delete ${user.name} (${user.id}) from PostgreSQL? This action cannot be undone.`,
      "Delete Account",
      "Cancel"
    );
    if (confirmed) {
      try {
        await deleteUser(user.userId);
        showToast(`User ${user.name} deleted successfully from database`, "success");
        fetchUsers(false);
      } catch (err) {
        console.error("Failed to delete user:", err);
        showErrorAlert("Deletion Failed", "Unable to remove user account from database.");
      }
    }
  };

  // Action: Save Edited User to PostgreSQL
  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editUser.userId, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        phone: editUser.phone === "Not available" ? "" : editUser.phone,
        role: toBackendRole(editUser.role),
        isActive: editUser.status === "Active",
      });
      setEditUser(null);
      showSuccessAlert("Profile Saved", `User profile for ${editUser.name} updated in PostgreSQL.`);
      fetchUsers(false);
    } catch (err) {
      console.error("Failed to update user:", err);
      showErrorAlert("Update Failed", "Could not save user modifications to PostgreSQL database.");
    }
  };

  // Action: Create New User in PostgreSQL
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.email) {
      showErrorAlert("Required Fields", "Please enter at least first name and email address.");
      return;
    }
    try {
      await createUser({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: toBackendRole(newUser.role),
        password: newUser.password || "Password@123",
      });
      setShowAddModal(false);
      setNewUser({ firstName: "", lastName: "", email: "", role: "Buyer", phone: "", password: "" });
      showSuccessAlert("User Created", `New user ${newUser.firstName} added to PostgreSQL database.`);
      fetchUsers(false);
    } catch (err) {
      console.error("Failed to create user:", err);
      showErrorAlert("Creation Failed", err.response?.data?.message || "Could not register new user in database.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* HEADER BAR */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 font-bold mb-2">
              <Users size={14} /> Enterprise Access Directory
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              User Management ({users.length} Users)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit, view, edit, activate/deactivate, and manage user accounts across all platform roles in PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => fetchUsers(true)}
              variant="outline"
              size="sm"
              icon={RotateCcw}
              loading={syncing || loading}
            >
              {syncing ? "Syncing..." : lastSyncTime ? `Sync (${lastSyncTime})` : "Sync Users"}
            </Button>

            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              size="sm"
              icon={UserPlus}
            >
              Add New User
            </Button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs flex items-center justify-between">
            <span>⚠️ {error}</span>
            <Button onClick={() => fetchUsers(true)} variant="danger" size="xs">Retry</Button>
          </div>
        )}

        {/* FILTERS & SEARCH WORKSTATION */}
        <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* SEARCH */}
            <div className="lg:col-span-5 relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by ID, Name, Email, Phone, or Org..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
              />
            </div>

            {/* ROLE FILTER */}
            <div className="lg:col-span-3">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-medium cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="Buyer">Buyer</option>
                <option value="Real Estate Agent">Real Estate Agent</option>
                <option value="Legal Reviewer">Legal Reviewer</option>
                <option value="Financial Institution">Financial Institution</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            {/* STATUS FILTER */}
            <div className="lg:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-medium cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses ({users.length})</option>
                <option value="Active">Active ({users.filter((u) => u.status === "Active").length})</option>
                <option value="Inactive">Inactive ({users.filter((u) => u.status === "Inactive").length})</option>
              </select>
            </div>

            {/* SORT ORDER */}
            <div className="lg:col-span-2 flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-medium cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="userId">Sort: User ID</option>
                <option value="name">Sort: Name</option>
                <option value="role">Sort: Role</option>
                <option value="status">Sort: Status</option>
                <option value="createdDate">Sort: Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* ENTERPRISE DATA TABLE */}
        <div className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#334155] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 px-4 text-center">
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </div>
                    </td>
                  </tr>
                ) : paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => {
                    const isActive = u.status === "Active";
                    return (
                      <tr key={u.userId} className="hover:bg-slate-50/80 dark:hover:bg-[#0F172A]/60 transition-colors">
                        {/* USER ID */}
                        <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-cyan-400">
                          {u.id}
                        </td>

                        {/* NAME */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">{u.name}</div>
                          <span className="text-[10px] text-slate-400 block">{u.organization}</span>
                        </td>

                        {/* EMAIL */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {u.email}
                        </td>

                        {/* ROLE */}
                        <td className="py-3.5 px-4">
                          <Badge variant="primary">{u.role}</Badge>
                        </td>

                        {/* PHONE */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {u.phone}
                        </td>

                        {/* STATUS */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isActive
                                ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {u.status}
                          </span>
                        </td>

                        {/* LAST LOGIN */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                          {u.lastLogin}
                        </td>

                        {/* CREATED DATE */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                          {u.createdDate}
                        </td>

                        {/* ACTIONS BUTTONS */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* VIEW */}
                            <button
                              onClick={() => setViewUser(u)}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-300 hover:bg-blue-100 cursor-pointer"
                              title="View Dossier"
                            >
                              <Eye size={14} />
                            </button>

                            {/* EDIT */}
                            <button
                              onClick={() => setEditUser({ ...u })}
                              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                              title="Edit User"
                            >
                              <Edit size={14} />
                            </button>

                            {/* ROLE MODAL */}
                            <button
                              onClick={() => {
                                setRoleChangeUser(u);
                                setNewSelectedRole(u.role);
                              }}
                              className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 hover:bg-purple-100 cursor-pointer"
                              title="Change Role"
                            >
                              <Key size={14} />
                            </button>

                            {/* ACTIVATE / DEACTIVATE */}
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg cursor-pointer ${
                                isActive
                                  ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                  : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100"
                              }`}
                              title={isActive ? "Deactivate User" : "Activate User"}
                            >
                              {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <EmptyState
                        title="No Users Found"
                        message="No user accounts match your search or filter parameters in PostgreSQL."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="p-4 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between gap-4 font-mono text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-900 dark:text-white">{paginatedUsers.length}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> users (Page {currentPage} of {totalPages})
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1 font-bold"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1 font-bold"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL: VIEW USER DOSSIER */}
        <AnimatePresence>
          {viewUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck size={18} className="text-blue-500" /> User Profile Dossier
                  </h3>
                  <button onClick={() => setViewUser(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{viewUser.name}</span>
                      <Badge variant="primary">{viewUser.role}</Badge>
                    </div>
                    <span className="text-slate-400 block">{viewUser.organization}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">User ID</span>
                      <strong className="text-blue-600 dark:text-cyan-400">{viewUser.id}</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Status</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{viewUser.status}</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                      <strong className="text-slate-900 dark:text-white truncate block">{viewUser.email}</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                      <strong className="text-slate-900 dark:text-white">{viewUser.phone}</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Created Date</span>
                      <strong className="text-slate-900 dark:text-white">{viewUser.createdDate}</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Login</span>
                      <strong className="text-slate-900 dark:text-white">{viewUser.lastLogin}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={() => setViewUser(null)} variant="secondary" size="sm">Close Dossier</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: EDIT USER */}
        <AnimatePresence>
          {editUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.form
                onSubmit={handleSaveEditUser}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit size={18} className="text-amber-500" /> Edit User Account ({editUser.id})
                  </h3>
                  <button type="button" onClick={() => setEditUser(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                      <input type="text" value={editUser.firstName} onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" required />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                      <input type="text" value={editUser.lastName} onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                    <input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                      <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold">
                        <option value="Buyer">Buyer</option>
                        <option value="Real Estate Agent">Real Estate Agent</option>
                        <option value="Legal Reviewer">Legal Reviewer</option>
                        <option value="Financial Institution">Financial Institution</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                      <select value={editUser.status} onChange={(e) => setEditUser({ ...editUser, status: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input type="text" value={editUser.phone === "Not available" ? "" : editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" onClick={() => setEditUser(null)} variant="secondary" size="sm">Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Save Changes</Button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: CHANGE ROLE */}
        <AnimatePresence>
          {roleChangeUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Key size={18} className="text-purple-500" /> Change User Role
                  </h3>
                  <button onClick={() => setRoleChangeUser(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-300">
                    Assign a new security role for <strong className="text-slate-900 dark:text-white">{roleChangeUser.name}</strong> ({roleChangeUser.id}):
                  </p>

                  <select
                    value={newSelectedRole}
                    onChange={(e) => setNewSelectedRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Buyer">Buyer</option>
                    <option value="Real Estate Agent">Real Estate Agent</option>
                    <option value="Legal Reviewer">Legal Reviewer</option>
                    <option value="Financial Institution">Financial Institution</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button onClick={() => setRoleChangeUser(null)} variant="secondary" size="sm">Cancel</Button>
                  <Button onClick={handleSaveRoleChange} variant="primary" size="sm">Update Role</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: ADD USER */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.form
                onSubmit={handleCreateUser}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserPlus size={18} className="text-blue-500" /> Create Enterprise User
                  </h3>
                  <button type="button" onClick={() => setShowAddModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        placeholder="e.g. Rajesh"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        placeholder="e.g. Sharma"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="e.g. rajesh@lexjuris.in"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                      >
                        <option value="Buyer">Buyer</option>
                        <option value="Real Estate Agent">Real Estate Agent</option>
                        <option value="Legal Reviewer">Legal Reviewer</option>
                        <option value="Financial Institution">Financial Institution</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password (Optional)</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Default: Password@123"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" onClick={() => setShowAddModal(false)} variant="secondary" size="sm">Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Create Account</Button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default UserManagement;
