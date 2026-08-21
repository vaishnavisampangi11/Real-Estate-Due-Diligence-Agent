import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  ShieldCheck,
  Shield,
  Users,
  Building2,
  Scale,
  Landmark,
  Eye,
  Edit,
  UserPlus,
  UserMinus,
  Check,
  X,
  Lock,
  Key,
  Layers,
  Sparkles,
  Info,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { showErrorAlert, showSuccessAlert, showToast, showConfirmDialog } from "../utils/swal";
import {
  getAllRoles,
  createRole,
  updateRole,
  assignRoleToUser,
  removeRoleFromUser,
  deleteRole,
} from "../services/roleService";
import { getAllUsers } from "../services/userService";

// Role icon mapping helper
const getRoleIcon = (roleName) => {
  if (!roleName) return Shield;
  const r = roleName.toUpperCase();
  if (r.includes("ADMIN")) return ShieldCheck;
  if (r.includes("BUYER")) return Building2;
  if (r.includes("AGENT")) return Key;
  if (r.includes("LEGAL")) return Scale;
  if (r.includes("FINANCIAL")) return Landmark;
  return Shield;
};

// Format role display name
const formatRoleDisplayName = (roleName) => {
  if (!roleName) return "Role";
  const r = roleName.toUpperCase();
  if (r === "ADMINISTRATOR" || r === "ADMIN") return "Administrator";
  if (r === "REAL_ESTATE_AGENT" || r === "AGENT") return "Real Estate Agent";
  if (r === "LEGAL_REVIEWER" || r === "LEGAL") return "Legal Reviewer";
  if (r === "FINANCIAL_INSTITUTION" || r === "FINANCIAL") return "Financial Institution";
  if (r === "BUYER") return "Buyer";
  return roleName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modal Control States
  const [viewPermissionsRole, setViewPermissionsRole] = useState(null);
  const [editPermissionsRole, setEditPermissionsRole] = useState(null);
  const [assignRoleTarget, setAssignRoleTarget] = useState(null);
  const [removeRoleTarget, setRemoveRoleTarget] = useState(null);
  const [editRoleTarget, setEditRoleTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form States
  const [tempPermissions, setTempPermissions] = useState([]);
  const [selectedUserToAssign, setSelectedUserToAssign] = useState("");
  const [selectedUserToRemove, setSelectedUserToRemove] = useState("");
  const [newRoleForm, setNewRoleForm] = useState({
    roleName: "",
    description: "",
  });

  const fetchData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setSyncing(true);
      else setLoading(true);
      setError(null);

      const [rolesRes, usersRes] = await Promise.allSettled([
        getAllRoles(),
        getAllUsers(),
      ]);

      if (rolesRes.status === "fulfilled") {
        const rList = Array.isArray(rolesRes.value) ? rolesRes.value : (rolesRes.value?.data || []);
        setRoles(rList);
      } else {
        throw new Error(rolesRes.reason?.message || "Failed to load roles");
      }

      if (usersRes.status === "fulfilled") {
        const uList = Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value?.data || []);
        setUsersList(uList);
        if (uList.length > 0) {
          setSelectedUserToAssign(String(uList[0].userId || uList[0].id));
          setSelectedUserToRemove(String(uList[0].userId || uList[0].id));
        }
      }

      const nowStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSyncTime(nowStr);

      if (isManual) {
        showToast("RBAC role registry refreshed from PostgreSQL database", "success");
      }
    } catch (err) {
      console.error("Failed to load role management data:", err);
      setError("Unable to load roles. Please check the backend connection.");
      setRoles([]);
      if (isManual) {
        showToast("Failed to refresh role records", "error");
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dynamic KPI Summary Metrics
  const summary = useMemo(() => {
    const totalRoles = roles.length;
    const activeUsers = roles.reduce((sum, r) => sum + (Number(r.activeUserCount) || 0), 0);
    const assignedUsers = roles.reduce((sum, r) => sum + (Number(r.userCount) || 0), 0);
    const allPerms = new Set();
    roles.forEach((r) => {
      if (Array.isArray(r.permissions)) {
        r.permissions.forEach((p) => allPerms.add(p));
      }
    });

    return {
      totalRoles,
      activeUsers,
      assignedUsers,
      totalPermissions: allPerms.size,
    };
  }, [roles]);

  // Filtered & Sorted Roles
  const filteredRoles = useMemo(() => {
    return roles
      .filter((role) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          role.roleName.toLowerCase().includes(q) ||
          (role.description && role.description.toLowerCase().includes(q)) ||
          (Array.isArray(role.permissions) && role.permissions.some((p) => p.toLowerCase().includes(q)));

        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "ACTIVE" && role.isActive !== false) ||
          (statusFilter === "INACTIVE" && role.isActive === false);

        return matchesQuery && matchesStatus;
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
  }, [roles, searchQuery, statusFilter, sortBy, sortOrder]);

  // Action: Open Edit Permissions Modal
  const handleOpenEditPermissions = (role) => {
    setEditPermissionsRole(role);
    setTempPermissions([...(role.permissions || [])]);
  };

  const handleTogglePermission = (perm) => {
    if (tempPermissions.includes(perm)) {
      setTempPermissions(tempPermissions.filter((p) => p !== perm));
    } else {
      setTempPermissions([...tempPermissions, perm]);
    }
  };

  // Action: Save Permissions
  const handleSavePermissions = async (e) => {
    e.preventDefault();
    if (!editPermissionsRole) return;
    try {
      await updateRole(editPermissionsRole.roleId, {
        roleName: editPermissionsRole.roleName,
        description: editPermissionsRole.description,
        isActive: editPermissionsRole.isActive,
        permissions: tempPermissions,
      });
      showSuccessAlert(
        "Permissions Updated",
        `Configured ${tempPermissions.length} permissions for role '${formatRoleDisplayName(editPermissionsRole.roleName)}'.`
      );
      setEditPermissionsRole(null);
      fetchData(false);
    } catch (err) {
      console.error("Failed to update role permissions:", err);
      showErrorAlert("Update Failed", "Could not update permissions in database.");
    }
  };

  // Action: Assign Role to User in PostgreSQL
  const handleAssignRoleSubmit = async (e) => {
    e.preventDefault();
    if (!assignRoleTarget || !selectedUserToAssign) return;
    try {
      await assignRoleToUser(assignRoleTarget.roleId, selectedUserToAssign);
      const userObj = usersList.find((u) => String(u.userId || u.id) === String(selectedUserToAssign));
      showSuccessAlert(
        "Role Assigned",
        `Assigned role '${formatRoleDisplayName(assignRoleTarget.roleName)}' to user ${userObj ? userObj.fullName || userObj.firstName : selectedUserToAssign} in PostgreSQL.`
      );
      setAssignRoleTarget(null);
      fetchData(false);
    } catch (err) {
      console.error("Failed to assign role:", err);
      showErrorAlert("Assignment Failed", err.response?.data?.message || "Could not assign role to user in database.");
    }
  };

  // Action: Remove Role from User in PostgreSQL
  const handleRemoveRoleSubmit = async (e) => {
    e.preventDefault();
    if (!removeRoleTarget || !selectedUserToRemove) return;
    try {
      await removeRoleFromUser(removeRoleTarget.roleId, selectedUserToRemove);
      const userObj = usersList.find((u) => String(u.userId || u.id) === String(selectedUserToRemove));
      showToast(
        `Unassigned role '${formatRoleDisplayName(removeRoleTarget.roleName)}' from user ${userObj ? userObj.fullName || userObj.firstName : selectedUserToRemove}`,
        "info"
      );
      setRemoveRoleTarget(null);
      fetchData(false);
    } catch (err) {
      console.error("Failed to remove role:", err);
      showErrorAlert("Removal Failed", "Could not remove role assignment in database.");
    }
  };

  // Action: Create New Role
  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleForm.roleName) {
      showErrorAlert("Required Field", "Please enter a role name.");
      return;
    }
    try {
      await createRole({
        roleName: newRoleForm.roleName.toUpperCase(),
        description: newRoleForm.description,
        isActive: true,
      });
      showSuccessAlert("Role Created", `Role '${newRoleForm.roleName}' created successfully in PostgreSQL.`);
      setShowCreateModal(false);
      setNewRoleForm({ roleName: "", description: "" });
      fetchData(false);
    } catch (err) {
      console.error("Failed to create role:", err);
      showErrorAlert("Creation Failed", err.response?.data?.message || "Could not create role in database.");
    }
  };

  // Action: Edit Role Details
  const handleEditRoleSubmit = async (e) => {
    e.preventDefault();
    if (!editRoleTarget) return;
    try {
      await updateRole(editRoleTarget.roleId, {
        roleName: editRoleTarget.roleName,
        description: editRoleTarget.description,
        isActive: editRoleTarget.isActive,
      });
      showSuccessAlert("Role Updated", `Role '${formatRoleDisplayName(editRoleTarget.roleName)}' details updated.`);
      setEditRoleTarget(null);
      fetchData(false);
    } catch (err) {
      console.error("Failed to update role:", err);
      showErrorAlert("Update Failed", "Could not update role in database.");
    }
  };

  // Action: Delete Role
  const handleDeleteRole = async (role) => {
    if (role.userCount > 0) {
      const confirmed = await showConfirmDialog(
        "Role Has Active Users",
        `Warning: There are ${role.userCount} user(s) currently assigned to '${formatRoleDisplayName(role.roleName)}'. Are you sure you want to permanently delete this role?`,
        "Delete Anyway",
        "Cancel"
      );
      if (!confirmed) return;
    } else {
      const confirmed = await showConfirmDialog(
        "Delete System Role?",
        `Are you sure you want to delete '${formatRoleDisplayName(role.roleName)}'?`,
        "Delete Role",
        "Cancel"
      );
      if (!confirmed) return;
    }

    try {
      await deleteRole(role.roleId);
      showToast(`Role '${formatRoleDisplayName(role.roleName)}' deleted successfully`, "success");
      fetchData(false);
    } catch (err) {
      console.error("Failed to delete role:", err);
      showErrorAlert("Deletion Failed", "Unable to remove role from database.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* HEADER BAR */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold mb-2">
              <ShieldCheck size={14} /> RBAC Access Control & Role Registry
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Role Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure access levels, granular permission matrixes, and manage roles across all live enterprise user tiers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => fetchData(true)}
              variant="outline"
              size="sm"
              icon={RotateCcw}
              loading={syncing || loading}
            >
              {syncing ? "Syncing..." : lastSyncTime ? `Sync (${lastSyncTime})` : "Sync Roles"}
            </Button>

            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              Create Role
            </Button>
          </div>
        </div>

        {/* SUMMARY KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Roles</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{loading ? "..." : summary.totalRoles}</div>
            <span className="text-[10px] text-blue-500 font-medium">PostgreSQL System Roles</span>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Users</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{loading ? "..." : summary.activeUsers}</div>
            <span className="text-[10px] text-emerald-500 font-medium">Live Enabled Accounts</span>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assigned Users</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{loading ? "..." : summary.assignedUsers}</div>
            <span className="text-[10px] text-purple-500 font-medium">Total Assigned Members</span>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Permissions</span>
            <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{loading ? "..." : summary.totalPermissions}</div>
            <span className="text-[10px] text-cyan-500 font-medium">Granular RBAC Rules</span>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs flex items-center justify-between">
            <span>⚠️ {error}</span>
            <Button onClick={() => fetchData(true)} variant="danger" size="xs">Retry</Button>
          </div>
        )}

        {/* SEARCH & FILTERS WORKSTATION */}
        <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* SEARCH */}
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles by name, description, or permission..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-medium"
              />
            </div>

            {/* STATUS FILTER */}
            <div className="lg:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-medium cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Role Statuses ({roles.length})</option>
                <option value="ACTIVE">Active Roles ({roles.filter((r) => r.isActive !== false).length})</option>
                <option value="INACTIVE">Inactive Roles ({roles.filter((r) => r.isActive === false).length})</option>
              </select>
            </div>

            {/* SORT ORDER */}
            <div className="lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-medium cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="name">Sort: Role Name</option>
                <option value="activeUserCount">Sort: Active Users</option>
                <option value="userCount">Sort: Total Users</option>
                <option value="createdAt">Sort: Created Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* LIVE ROLES CARDS CONTAINER */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] space-y-3">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-8 w-64 rounded-xl" />
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] space-y-3">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-8 w-64 rounded-xl" />
              </div>
            </div>
          ) : filteredRoles.length > 0 ? (
            filteredRoles.map((role) => {
              const IconComp = getRoleIcon(role.roleName);
              const displayName = formatRoleDisplayName(role.roleName);
              const perms = Array.isArray(role.permissions) ? role.permissions : [];
              const activeCount = role.activeUserCount ?? 0;
              const totalCount = role.userCount ?? 0;

              return (
                <motion.div
                  key={role.roleId || role.roleName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 transition-all hover:border-purple-500/40"
                >
                  {/* ROLE HEADER ROW */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-purple-600 dark:text-cyan-400 shrink-0">
                        <IconComp size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-lg font-black text-slate-900 dark:text-white">
                            {displayName}
                          </h2>
                          <Badge variant="success">{activeCount} Active Users</Badge>
                          <span className="text-[10px] text-slate-400">({totalCount} Total)</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-3xl">
                          {role.description || "System configured security role."}
                        </p>
                      </div>
                    </div>

                    {/* 4 REQUIRED ACTION BUTTONS */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* 1. VIEW PERMISSIONS */}
                      <button
                        onClick={() => setViewPermissionsRole(role)}
                        className="py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        <span>View Permissions</span>
                      </button>

                      {/* 2. EDIT PERMISSIONS */}
                      <button
                        onClick={() => handleOpenEditPermissions(role)}
                        className="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit size={14} />
                        <span>Edit Permissions</span>
                      </button>

                      {/* 3. ASSIGN ROLE */}
                      <button
                        onClick={() => {
                          setAssignRoleTarget(role);
                          if (usersList.length > 0) {
                            setSelectedUserToAssign(String(usersList[0].userId || usersList[0].id));
                          }
                        }}
                        className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <UserPlus size={14} />
                        <span>Assign Role</span>
                      </button>

                      {/* 4. REMOVE ROLE */}
                      <button
                        onClick={() => {
                          setRemoveRoleTarget(role);
                          const matchingUsers = usersList.filter(
                            (u) => (u.role?.toUpperCase() || "") === role.roleName.toUpperCase()
                          );
                          if (matchingUsers.length > 0) {
                            setSelectedUserToRemove(String(matchingUsers[0].userId || matchingUsers[0].id));
                          } else if (usersList.length > 0) {
                            setSelectedUserToRemove(String(usersList[0].userId || usersList[0].id));
                          }
                        }}
                        className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <UserMinus size={14} />
                        <span>Remove Role</span>
                      </button>
                    </div>
                  </div>

                  {/* PERMISSIONS BADGES GRID */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Granted Permissions ({perms.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {perms.map((perm, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#334155] font-bold text-[10px] flex items-center gap-1"
                        >
                          <Lock size={11} className="text-purple-500" />
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-[#334155] text-center">
              <EmptyState
                title="No Roles Found"
                message="No system roles match your search or filter parameters in PostgreSQL."
              />
            </div>
          )}
        </div>

        {/* MODAL 1: VIEW PERMISSIONS */}
        <AnimatePresence>
          {viewPermissionsRole && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-blue-500" /> Permissions Matrix ({formatRoleDisplayName(viewPermissionsRole.roleName)})
                  </h3>
                  <button onClick={() => setViewPermissionsRole(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Role <strong className="text-slate-900 dark:text-white">{formatRoleDisplayName(viewPermissionsRole.roleName)}</strong> currently holds the following {(viewPermissionsRole.permissions || []).length} active permissions:
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {(viewPermissionsRole.permissions || []).map((p, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Check size={14} className="text-emerald-500" /> {p}
                        </span>
                        <Badge variant="success">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={() => setViewPermissionsRole(null)} variant="secondary" size="sm">Close</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: EDIT PERMISSIONS */}
        <AnimatePresence>
          {editPermissionsRole && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.form
                onSubmit={handleSavePermissions}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit size={18} className="text-amber-500" /> Edit Permissions: {formatRoleDisplayName(editPermissionsRole.roleName)}
                  </h3>
                  <button type="button" onClick={() => setEditPermissionsRole(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Toggle Available Permissions:
                  </span>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {(editPermissionsRole.availablePermissions || editPermissionsRole.permissions || []).map((perm) => {
                      const isChecked = tempPermissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          onClick={() => handleTogglePermission(perm)}
                          className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? "bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-cyan-300"
                              : "bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-500"
                          }`}
                        >
                          <span className="font-bold">{perm}</span>
                          <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded cursor-pointer" />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" onClick={() => setEditPermissionsRole(null)} variant="secondary" size="sm">Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Save Permissions</Button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 3: ASSIGN ROLE */}
        <AnimatePresence>
          {assignRoleTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.form
                onSubmit={handleAssignRoleSubmit}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserPlus size={18} className="text-emerald-500" /> Assign Role ({formatRoleDisplayName(assignRoleTarget.roleName)})
                  </h3>
                  <button type="button" onClick={() => setAssignRoleTarget(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <p className="text-slate-500 dark:text-slate-400">
                    Select a registered user to assign the <strong className="text-slate-900 dark:text-white">{formatRoleDisplayName(assignRoleTarget.roleName)}</strong> role in PostgreSQL:
                  </p>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">User Account</label>
                    <select
                      value={selectedUserToAssign}
                      onChange={(e) => setSelectedUserToAssign(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    >
                      {usersList.map((u) => (
                        <option key={u.userId || u.id} value={u.userId || u.id}>
                          {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'User'} ({u.email}) - Current: {formatRoleDisplayName(u.role?.roleName || u.role)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" onClick={() => setAssignRoleTarget(null)} variant="secondary" size="sm">Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Confirm Assignment</Button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 4: REMOVE ROLE */}
        <AnimatePresence>
          {removeRoleTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.form
                onSubmit={handleRemoveRoleSubmit}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserMinus size={18} className="text-rose-500" /> Remove Role ({formatRoleDisplayName(removeRoleTarget.roleName)})
                  </h3>
                  <button type="button" onClick={() => setRemoveRoleTarget(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <p className="text-slate-500 dark:text-slate-400">
                    Select an assigned user to unassign from <strong className="text-slate-900 dark:text-white">{formatRoleDisplayName(removeRoleTarget.roleName)}</strong>:
                  </p>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned User</label>
                    <select
                      value={selectedUserToRemove}
                      onChange={(e) => setSelectedUserToRemove(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    >
                      {usersList
                        .filter((u) => {
                          const rName = u.role?.roleName || u.role;
                          return rName && rName.toUpperCase() === removeRoleTarget.roleName.toUpperCase();
                        })
                        .map((u) => (
                          <option key={u.userId || u.id} value={u.userId || u.id}>
                            {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name} ({u.email})
                          </option>
                        ))}
                      {usersList.filter((u) => (u.role?.roleName || u.role)?.toUpperCase() === removeRoleTarget.roleName.toUpperCase()).length === 0 && (
                        <option value="">No users currently assigned to this role</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" onClick={() => setRemoveRoleTarget(null)} variant="secondary" size="sm">Cancel</Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                    disabled={usersList.filter((u) => (u.role?.roleName || u.role)?.toUpperCase() === removeRoleTarget.roleName.toUpperCase()).length === 0}
                  >
                    Remove Role
                  </Button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 5: CREATE ROLE */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.form
                onSubmit={handleCreateRoleSubmit}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Plus size={18} className="text-purple-500" /> Create System Role
                  </h3>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role Name *</label>
                    <input
                      type="text"
                      value={newRoleForm.roleName}
                      onChange={(e) => setNewRoleForm({ ...newRoleForm, roleName: e.target.value })}
                      placeholder="e.g. COMPLIANCE_AUDITOR"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                      value={newRoleForm.description}
                      onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                      placeholder="Role purpose and access scope..."
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" onClick={() => setShowCreateModal(false)} variant="secondary" size="sm">Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Create Role</Button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default RoleManagement;
