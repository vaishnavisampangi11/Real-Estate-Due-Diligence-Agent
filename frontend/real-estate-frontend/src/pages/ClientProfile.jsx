import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Phone,
  Mail,
  Home,
  ChevronRight,
  ShieldCheck,
  Building,
  DollarSign,
  Eye,
  ExternalLink,
  RefreshCw,
  User,
  Briefcase,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  getOwnerById,
  getAllProperties,
  getOwnershipRecords,
} from "../services/propertyService";

function ClientProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawId = searchParams.get("id") || "1";
  const ownerId = parseInt(rawId.replace(/\D/g, "") || "1", 10);

  const [client, setClient] = useState(null);
  const [assignedProperties, setAssignedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClientProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getOwnerById(ownerId);
      const data = res.data || res;
      setClient(data);

      // Fetch properties to match ownership
      const propsRes = await getAllProperties(0, 50);
      const propsList = propsRes?.data?.content || (Array.isArray(propsRes?.data) ? propsRes.data : []);

      const matches = [];
      for (const p of propsList) {
        const pId = p.propertyId || p.id;
        try {
          const recRes = await getOwnershipRecords(pId);
          const recs = Array.isArray(recRes.data) ? recRes.data : [];
          const match = recs.find((r) => r.ownerId === ownerId);
          if (match) {
            matches.push({
              propertyId: pId,
              propertyName: p.propertyName || `Property PR-${pId}`,
              propertyCode: `PR-${pId}`,
              marketValue: p.marketValue,
              city: p.city,
              state: p.state,
              share: match.ownershipPercentage || 100,
            });
          }
        } catch (e) {}
      }

      setAssignedProperties(matches);
    } catch (err) {
      console.error("Failed to fetch client profile:", err);
      setError("Client record not found in PostgreSQL registry.");
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientProfile();
  }, [ownerId]);

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-[#CBD5E1]">
          <Link to="/agent/dashboard" className="hover:text-blue-600 dark:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Home size={14} /> Agent Workspace
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <Link to="/agent/clients" className="hover:text-blue-600 dark:text-cyan-400 transition-colors">
            Clients
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
            {client?.ownerName || `Client #${ownerId}`}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : error || !client ? (
          <div className="py-12">
            <EmptyState
              title="Client Record Not Found"
              message={error || "The requested client dossier does not exist in the database."}
              actionLabel="Return to Client Accounts"
              onAction={() => navigate("/agent/clients")}
            />
          </div>
        ) : (
          <>
            {/* Client Profile Header Dossier */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                  {client.ownerType === "COMPANY" ? <Building size={28} /> : <User size={28} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold">
                      CLT-#{client.ownerId}
                    </span>
                    <Badge variant="success">{client.ownerType}</Badge>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {client.ownerName}
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Active Client Entity in PostgreSQL</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  onClick={() => navigate("/agent/clients")}
                  variant="outline"
                  size="xs"
                >
                  All Clients
                </Button>
              </div>
            </div>

            {/* Client Contact & Properties Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-[#334155] pb-3 flex items-center gap-2">
                  <Briefcase size={15} className="text-blue-600 dark:text-cyan-400" />
                  Account Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Entity Name</span>
                    <strong className="text-slate-900 dark:text-white text-xs block mt-0.5">
                      {client.ownerName}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Email Channel</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" />
                      <span>{client.email || "Not specified"}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone Number</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" />
                      <span>{client.phone || "Not specified"}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Registry Status</span>
                    <span className="text-emerald-600 font-bold text-xs block mt-0.5">Active</span>
                  </div>
                </div>
              </div>

              {/* Linked Real Property Assets */}
              <div className="lg:col-span-2 white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-[#334155] pb-3 flex items-center gap-2">
                  <Building2 size={15} className="text-indigo-600 dark:text-indigo-400" />
                  Linked Property Assets ({assignedProperties.length})
                </h3>

                {assignedProperties.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <p className="text-slate-500 font-bold">No property ownership records linked</p>
                    <p className="text-[11px] text-slate-400">
                      Ownership splits can be configured in the Property Management portal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedProperties.map((p) => {
                      const valCr = (Number(p.marketValue || 0) / 10000000).toFixed(2);
                      return (
                        <div
                          key={p.propertyId}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-600 dark:text-cyan-400 text-xs">
                                {p.propertyCode}
                              </span>
                              <strong className="text-slate-900 dark:text-white text-xs">
                                {p.propertyName}
                              </strong>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {p.city}, {p.state} • Valuation: ₹ {valCr} Cr • Ownership Share: {p.share}%
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => navigate(`/property-details?id=${p.propertyId}`)}
                              variant="outline"
                              size="xs"
                              icon={Eye}
                            >
                              Details
                            </Button>
                            <Button
                              onClick={() => navigate(`/due-diligence-report?id=${p.propertyId}`)}
                              variant="primary"
                              size="xs"
                              icon={ExternalLink}
                            >
                              Due Diligence
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default ClientProfile;
