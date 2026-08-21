import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  Search,
  Mail,
  Phone,
  Home,
  ChevronRight,
  UserPlus,
  X,
  Eye,
  Trash2,
  Filter,
  CheckCircle2,
  Building,
  Save,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  User,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { showSuccessAlert, showConfirmDialog, showToast } from "../utils/swal";
import {
  getAllOwners,
  createOwner,
  deleteOwner,
  getAllProperties,
  getOwnershipRecords,
} from "../services/propertyService";

function AgentClients() {
  const navigate = useNavigate();

  // State
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NAME_ASC");

  // Create Client Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    phone: "",
    ownerType: "COMPANY",
  });
  const [submitting, setSubmitting] = useState(false);

  // View Client Modal State
  const [selectedClient, setSelectedClient] = useState(null);

  // Fetch real PostgreSQL Client/Owner accounts and property ownership
  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Real Owners
      const ownersRes = await getAllOwners();
      const ownersList = Array.isArray(ownersRes.data)
        ? ownersRes.data
        : Array.isArray(ownersRes)
        ? ownersRes
        : [];

      // 2. Fetch Real Properties
      const propsRes = await getAllProperties(0, 50);
      const propsList =
        propsRes?.data?.content || (Array.isArray(propsRes?.data) ? propsRes.data : []);

      setProperties(propsList);

      // 3. Map real owned properties per owner
      // In our verified database schema, we check ownership splits
      const mappedClients = await Promise.all(
        ownersList.map(async (owner) => {
          let assignedProps = [];
          // Find properties matching owner ID
          for (const prop of propsList) {
            const pId = prop.propertyId || prop.id;
            try {
              const recRes = await getOwnershipRecords(pId);
              const recs = Array.isArray(recRes.data) ? recRes.data : [];
              const match = recs.find((r) => r.ownerId === owner.ownerId);
              if (match) {
                assignedProps.push({
                  propertyId: pId,
                  propertyName: prop.propertyName || `Property PR-${pId}`,
                  propertyCode: `PR-${pId}`,
                  share: match.ownershipPercentage || 100,
                  city: prop.city || "Hyderabad",
                });
              }
            } catch (e) {
              // fallback check
            }
          }

          return {
            id: `CLT-${owner.ownerId}`,
            ownerId: owner.ownerId,
            name: owner.ownerName,
            email: owner.email || "—",
            phone: owner.phone || "—",
            ownerType: owner.ownerType || "INDIVIDUAL",
            isActive: owner.isActive !== false,
            assignedProperties: assignedProps,
            createdAt: owner.createdAt,
          };
        })
      );

      setClients(mappedClients);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to load real client accounts:", err);
      setError("Unable to connect to backend registry. Please verify Spring Boot is running on port 8081.");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  // Filter & Search Logic
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchType = typeFilter === "ALL" || (c.ownerType || "").toUpperCase() === typeFilter.toUpperCase();
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        String(c.ownerId).includes(q) ||
        (c.assignedProperties &&
          c.assignedProperties.some((p) => p.propertyName.toLowerCase().includes(q) || p.propertyCode.toLowerCase().includes(q)));

      return matchType && matchSearch;
    });
  }, [clients, typeFilter, searchQuery]);

  // Sort Logic
  const sortedClients = useMemo(() => {
    const list = [...filteredClients];
    if (sortBy === "NAME_ASC") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "NAME_DESC") {
      list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (sortBy === "PROPS_DESC") {
      list.sort((a, b) => (b.assignedProperties?.length || 0) - (a.assignedProperties?.length || 0));
    }
    return list;
  }, [filteredClients, sortBy]);

  // Handle Create Real Client in PostgreSQL
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ownerName.trim()) {
      showToast("Please enter client/owner name", "warning");
      return;
    }

    try {
      setSubmitting(true);
      await createOwner({
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        ownerType: formData.ownerType,
      });

      showSuccessAlert(
        "Client Account Created",
        `Client "${formData.ownerName}" has been registered in the database.`
      );

      setCreateModalOpen(false);
      setFormData({ ownerName: "", email: "", phone: "", ownerType: "COMPANY" });
      fetchClientData();
    } catch (err) {
      console.error("Client creation failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed to create client account.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Real Client from PostgreSQL
  const handleDeleteClient = async (client) => {
    const confirmed = await showConfirmDialog({
      title: `Delete Client Account?`,
      text: `Are you sure you want to remove "${client.name}" from the client registry? This operation requires database confirmation.`,
      confirmButtonText: "Yes, Delete Account",
      cancelButtonText: "Cancel",
      icon: "warning",
    });

    if (confirmed) {
      try {
        await deleteOwner(client.ownerId);
        showToast(`Client "${client.name}" removed successfully.`, "success");
        setClients((prev) => prev.filter((c) => c.ownerId !== client.ownerId));
      } catch (err) {
        console.error("Failed to delete client:", err);
        const msg =
          err.response?.data?.message ||
          "Unable to delete client. If this client has linked ownership records, remove the property assignments first.";
        showToast(msg, "error");
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* BREADCRUMB HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 dark:text-[#CBD5E1]">
          <nav className="flex items-center gap-2">
            <Link to="/agent/dashboard" className="hover:text-blue-600 dark:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Home size={14} /> Agent Workspace
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Client Accounts & Portfolios
            </span>
          </nav>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <span className="text-[11px] text-slate-400">
                Synced {lastSyncTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Button
              variant="outline"
              size="xs"
              onClick={fetchClientData}
              loading={loading}
              icon={RefreshCw}
            >
              Sync
            </Button>
          </div>
        </div>

        {/* ERROR STATE BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
            <Button variant="danger" size="xs" onClick={fetchClientData}>
              Retry
            </Button>
          </div>
        )}

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <Users size={13} /> Institutional & Individual Client Accounts
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              👥 Client Accounts & Portfolios
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              Manage client institutional entities, property asset ownership, and due diligence dossiers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setCreateModalOpen(true)}
              variant="primary"
              size="sm"
              icon={UserPlus}
            >
              Register Client Account
            </Button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Total Clients</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : clients.length}
              </strong>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                <Users size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Corporate / Trust</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {loading ? "..." : clients.filter((c) => c.ownerType === "COMPANY" || c.ownerType === "TRUST").length}
              </strong>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Briefcase size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Individual Owners</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : clients.filter((c) => c.ownerType === "INDIVIDUAL").length}
              </strong>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <User size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Assigned Properties</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {loading ? "..." : properties.length}
              </strong>
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Building2 size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="white-card rounded-3xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients by name, email, phone or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Filter size={13} className="text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Client Types</option>
                <option value="COMPANY">Companies</option>
                <option value="INDIVIDUAL">Individuals</option>
                <option value="TRUST">Trusts</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="NAME_ASC">Name (A-Z)</option>
                <option value="NAME_DESC">Name (Z-A)</option>
                <option value="PROPS_DESC">Most Properties</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && clients.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No Client Accounts"
              message="You don't currently have any client or institutional accounts registered."
              actionLabel="Register Client Account"
              onAction={() => setCreateModalOpen(true)}
            />
          </div>
        )}

        {/* SEARCH EMPTY STATE */}
        {!loading && !error && clients.length > 0 && sortedClients.length === 0 && (
          <div className="py-8">
            <EmptyState
              title="No matching clients found"
              message={`No client account matched "${searchQuery}".`}
              actionLabel="Clear Search"
              onAction={() => {
                setSearchQuery("");
                setTypeFilter("ALL");
              }}
            />
          </div>
        )}

        {/* CLIENT ACCOUNTS GRID / CARDS */}
        {!loading && !error && sortedClients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedClients.map((client) => {
              const isCompany = client.ownerType === "COMPANY";
              const isTrust = client.ownerType === "TRUST";

              return (
                <div
                  key={client.ownerId}
                  className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 flex flex-col justify-between hover:border-blue-400 dark:hover:border-cyan-500 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">
                        {client.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isCompany
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
                            : isTrust
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        }`}
                      >
                        {client.ownerType}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {client.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Mail size={12} className="text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </p>
                      {client.phone && client.phone !== "—" && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone size={12} className="text-slate-400" />
                          <span>{client.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Assigned Properties in Database */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#334155] space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Assigned Property Assets ({client.assignedProperties.length})
                      </span>
                      {client.assignedProperties.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No linked property records</p>
                      ) : (
                        <div className="space-y-1">
                          {client.assignedProperties.map((p) => (
                            <div
                              key={p.propertyId}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#334155] flex items-center justify-between"
                            >
                              <div className="truncate mr-2">
                                <strong className="font-bold text-slate-900 dark:text-white text-[11px] block truncate">
                                  {p.propertyCode}: {p.propertyName}
                                </strong>
                                <span className="text-[10px] text-slate-400">{p.city}</span>
                              </div>
                              <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 shrink-0">
                                {p.share}% share
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => handleDeleteClient(client)}
                      className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 text-rose-600 dark:text-rose-300 hover:text-white transition-colors cursor-pointer"
                      title="Delete Client Account"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* REGISTER CLIENT MODAL */}
        <AnimatePresence>
          {createModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCreateModalOpen(false)}
                className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 max-w-md w-full space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#334155]">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserPlus size={16} className="text-blue-600 dark:text-cyan-400" />
                    Register Client Account
                  </h3>
                  <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Client / Entity Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Real Estate Capital Ltd"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. contact@apexcapital.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98200 12345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Client Entity Type
                    </label>
                    <select
                      value={formData.ownerType}
                      onChange={(e) => setFormData({ ...formData, ownerType: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold cursor-pointer"
                    >
                      <option value="COMPANY">Company / Institutional Entity</option>
                      <option value="INDIVIDUAL">Individual Property Owner</option>
                      <option value="TRUST">Trust / Endowment Fund</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#334155]">
                    <Button onClick={() => setCreateModalOpen(false)} variant="secondary" size="xs">
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="xs" loading={submitting} icon={Save}>
                      Save Client
                    </Button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* CLIENT DETAILS MODAL */}
        <AnimatePresence>
          {selectedClient && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedClient(null)}
                className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 max-w-lg w-full space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#334155]">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold block">
                      CLIENT DOSSIER #{selectedClient.ownerId}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedClient.name}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="p-1 text-slate-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Entity Type</span>
                      <strong className="text-slate-900 dark:text-white text-xs block mt-0.5">
                        {selectedClient.ownerType}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Registry Status</span>
                      <span className="text-emerald-600 font-bold text-xs block mt-0.5">Active</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Email</span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs block mt-0.5 truncate">
                        {selectedClient.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone</span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs block mt-0.5">
                        {selectedClient.phone}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Owned Properties & Share Breakdown
                    </span>
                    {selectedClient.assignedProperties.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
                        No property assets currently linked to this client entity in PostgreSQL.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedClient.assignedProperties.map((p) => (
                          <div
                            key={p.propertyId}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between"
                          >
                            <div>
                              <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                                {p.propertyCode}: {p.propertyName}
                              </strong>
                              <span className="text-[10px] text-slate-400">{p.city}</span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedClient(null);
                                navigate(`/property-details?id=${p.propertyId}`);
                              }}
                              variant="outline"
                              size="xs"
                              icon={ExternalLink}
                            >
                              Inspect
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#334155]">
                  <Button onClick={() => setSelectedClient(null)} variant="primary" size="xs">
                    Close
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default AgentClients;
