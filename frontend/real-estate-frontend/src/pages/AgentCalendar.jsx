import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Home,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Send,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Building2,
  X,
  MapPin,
  Eye,
  Layers,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { showToast, showSuccessAlert } from "../utils/swal";
import { getAllProperties } from "../services/propertyService";

function AgentCalendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllProperties(0, 50);
        const list = res?.content || (Array.isArray(res) ? res : res?.data?.content || []);
        
        const eventTypes = ["Property Visits", "Meetings", "Sub-Registrar Inspections", "Deadlines", "Report Submission Dates"];
        const clients = [
          "Adani Realty Institutional Fund",
          "DLF Cybercity Portfolio",
          "GMR Logistics Infrastructure",
          "Prestige Capital Partners",
          "Sobha Real Estate Fund",
        ];

        const formatted = list.map((p, idx) => {
          const pId = p.propertyId || p.id || idx + 1;
          const pName = p.propertyName || p.title || `Property Parcel PR-${pId}`;
          const pCode = p.propertyCode || `PR-${pId}`;
          const day = 6 + (idx * 2);

          return {
            id: `EVT-80${pId}`,
            title: `${pName} Site Visit & Verification`,
            eventType: eventTypes[idx % eventTypes.length],
            date: `2026-08-${String(day).padStart(2, "0")}`,
            dayNumber: day,
            timeSlot: `${9 + (idx % 4)}:30 AM - ${11 + (idx % 4)}:00 AM`,
            client: clients[idx % clients.length],
            property: `${pName} (${pCode})`,
            location: p.address?.city ? `${p.address.addressLine1 || ""}, ${p.address.city}` : "Hyderabad",
            priority: idx % 2 === 0 ? "HIGH" : "MEDIUM",
            notes: `Conduct physical boundary survey and due diligence verification for ${pName}.`,
          };
        });

        setEvents(formatted);
      } catch (err) {
        console.error("Failed to load agent calendar:", err);
        setError("Unable to load calendar. Please verify backend is running on port 8081.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // View Mode State: 'month', 'week', 'day', 'agenda'
  const [viewMode, setViewMode] = useState("month");

  // Selected Date State (Defaults to Aug 6, 2026)
  const [selectedDayNumber, setSelectedDayNumber] = useState(6);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [eventDetailModal, setEventDetailModal] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Schedule Event Form State
  const [eventForm, setEventForm] = useState({
    title: "",
    eventType: "Property Visits",
    client: "Adani Realty Institutional Fund",
    property: "Gachibowli Tech Park Phase 2 (PR-1001)",
    date: "2026-08-20",
    dayNumber: 20,
    timeSlot: "11:00 AM",
    priority: "HIGH",
    location: "On-Site Office",
    notes: "",
  });

  // Event Type Styling Helper (Property Visits, Meetings, Deadlines, Due Diligence Reviews, Report Submission Dates)
  const getEventTypeStyle = (type) => {
    const safeType = type || "";
    switch (safeType) {
      case "Property Visits":
        return {
          badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-cyan-300 dark:border-blue-800",
          pill: "bg-blue-600 text-white",
          dot: "bg-blue-500",
          icon: Home,
        };
      case "Meetings":
        return {
          badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800",
          pill: "bg-purple-600 text-white",
          dot: "bg-purple-500",
          icon: Users,
        };
      case "Deadlines":
        return {
          badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800",
          pill: "bg-rose-600 text-white",
          dot: "bg-rose-500",
          icon: AlertTriangle,
        };
      case "Due Diligence Reviews":
        return {
          badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800",
          pill: "bg-amber-600 text-white",
          dot: "bg-amber-500",
          icon: ShieldCheck,
        };
      case "Report Submission Dates":
        return {
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800",
          pill: "bg-emerald-600 text-white",
          dot: "bg-emerald-500",
          icon: Send,
        };
      default:
        return {
          badge: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
          pill: "bg-slate-700 text-white",
          dot: "bg-slate-500",
          icon: CalendarIcon,
        };
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return (events || []).filter((evt) => {
      if (!evt) return false;
      const matchType = typeFilter === "ALL" || evt.eventType === typeFilter;
      const matchSearch =
        (evt.title || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        (evt.client || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        (evt.property || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        (evt.eventType || "").toLowerCase().includes((searchQuery || "").toLowerCase());

      return matchType && matchSearch;
    });
  }, [events, typeFilter, searchQuery]);

  // Selected Day's Events
  const selectedDayEvents = useMemo(() => {
    return filteredEvents.filter((e) => e && Number(e.dayNumber) === Number(selectedDayNumber));
  }, [filteredEvents, selectedDayNumber]);

  // Handlers
  const handleScheduleEventSubmit = (e) => {
    e.preventDefault();
    if (!eventForm.title) {
      showToast("Please enter event title", "error");
      return;
    }

    const created = {
      id: `EVT-80${events.length + 1}`,
      ...eventForm,
    };

    setEvents((prev) => [...prev, created]);
    showSuccessAlert("Event Scheduled", `Scheduled "${eventForm.title}" on August ${eventForm.dayNumber}, 2026.`);
    setScheduleModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Home size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Agent Operations Calendar
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
            AUGUST 2026 • {events.length} SCHEDULED EVENTS
          </span>
        </div>

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
              <CalendarIcon size={14} /> Due Diligence Schedule Workstation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              📅 Real Estate Agent Calendar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Manage property visits, client meetings, legal deadlines, due diligence reviews, and report submission dates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button onClick={() => setScheduleModalOpen(true)} variant="primary" size="sm" icon={PlusCircle}>
              Schedule Event
            </Button>
          </div>
        </div>

        {/* CALENDAR CONTROLS & EVENT TYPE LEGEND */}
        <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Month Navigator & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-[#0F172A] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#334155]">
                <CalendarIcon size={16} className="text-blue-500" />
                <span>August 2026</span>
              </div>

              {/* Search Box */}
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 pl-9 pr-3 py-1.5 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* THE 4 CALENDAR VIEW MODES (Month, Week, Day, Agenda View) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#334155] text-xs font-mono font-bold">
              {[
                { id: "month", label: "Month" },
                { id: "week", label: "Week" },
                { id: "day", label: "Day" },
                { id: "agenda", label: "Agenda View" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    viewMode === mode.id
                      ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-cyan-400 shadow-xs border border-slate-200 dark:border-[#334155]"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Event Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#334155] text-xs font-mono">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 mr-1">Event Types:</span>
            {[
              { id: "ALL", label: "All Events" },
              { id: "Property Visits", label: "Property Visits", color: "bg-blue-500" },
              { id: "Meetings", label: "Meetings", color: "bg-purple-500" },
              { id: "Deadlines", label: "Deadlines", color: "bg-rose-500" },
              { id: "Due Diligence Reviews", label: "Due Diligence Reviews", color: "bg-amber-500" },
              { id: "Report Submission Dates", label: "Report Submission Dates", color: "bg-emerald-500" },
            ].map((type) => {
              const active = typeFilter === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setTypeFilter(type.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-slate-50 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#334155] hover:border-blue-400"
                  }`}
                >
                  {type.color && <span className={`w-2 h-2 rounded-full ${type.color}`} />}
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. MONTH VIEW */}
        {viewMode === "month" && (
          <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xl space-y-4">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-500 pb-2 border-b border-slate-200 dark:border-[#334155]">
              <span>August 2026 Calendar Grid</span>
              <span className="text-blue-600 dark:text-cyan-400">Click any date to inspect daily schedule</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center font-mono">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
                <div key={i} className="text-[10px] font-extrabold text-slate-400 uppercase p-1">
                  {d}
                </div>
              ))}

              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isSelected = day === selectedDayNumber;
                const dayEvts = filteredEvents.filter((e) => e.dayNumber === day);

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDayNumber(day)}
                    className={`min-h-[90px] sm:min-h-[100px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left space-y-1 ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                        : "bg-slate-50/70 dark:bg-[#0F172A]/70 border-slate-200/80 dark:border-[#334155] hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded-lg ${
                        day === 6 ? "bg-blue-600 text-white" : "text-slate-700 dark:text-slate-300"
                      }`}>
                        {day}
                      </span>
                      {dayEvts.length > 0 && (
                        <span className="text-[9px] font-mono font-bold text-purple-600 dark:text-purple-300">
                          {dayEvts.length} Evt
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-hidden flex-1">
                      {dayEvts.slice(0, 2).map((evt) => {
                        const style = getEventTypeStyle(evt.eventType);
                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEventDetailModal(evt);
                            }}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold truncate ${style.pill} shadow-2xs hover:opacity-90`}
                            title={evt.title}
                          >
                            {evt.title}
                          </div>
                        );
                      })}
                      {dayEvts.length > 2 && (
                        <span className="text-[9px] font-mono text-slate-400 font-bold block">+ {dayEvts.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. WEEK VIEW */}
        {viewMode === "week" && (
          <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xl overflow-x-auto space-y-4">
            <div className="font-mono text-xs font-bold text-slate-500 pb-2 border-b border-slate-200 dark:border-[#334155]">
              Weekly Timeline Schedule (Aug 02 - Aug 08, 2026)
            </div>

            <div className="grid grid-cols-7 gap-3 min-w-[800px] text-xs font-mono">
              {[
                { dayName: "Sun", date: 2 },
                { dayName: "Mon", date: 3 },
                { dayName: "Tue", date: 4 },
                { dayName: "Wed", date: 5 },
                { dayName: "Thu", date: 6 },
                { dayName: "Fri", date: 7 },
                { dayName: "Sat", date: 8 },
              ].map((d) => {
                const dayEvts = filteredEvents.filter((e) => e.dayNumber === d.date);

                return (
                  <div key={d.date} className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3 min-h-[260px]">
                    <div className="text-center pb-2 border-b border-slate-200 dark:border-[#334155]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{d.dayName}</span>
                      <strong className={`text-sm font-extrabold ${d.date === 6 ? "text-blue-600 dark:text-cyan-400" : "text-slate-900 dark:text-white"}`}>Aug {d.date}</strong>
                    </div>

                    <div className="space-y-2">
                      {dayEvts.map((evt) => {
                        const style = getEventTypeStyle(evt.eventType);
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setEventDetailModal(evt)}
                            className={`p-2 rounded-xl text-[10px] font-mono space-y-1 cursor-pointer border ${style.badge}`}
                          >
                            <span className="font-bold block truncate">{evt.title}</span>
                            <span className="text-[9px] opacity-80 block">{evt.timeSlot}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. DAY VIEW */}
        {viewMode === "day" && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#334155]">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">DAILY TIMELINE SCHEDULE</span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" /> August {selectedDayNumber}, 2026
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {selectedDayEvents.length} Events Scheduled
              </span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <EmptyState title="No events scheduled" message={`No event scheduled for August ${selectedDayNumber}, 2026.`} />
            ) : (
              <div className="space-y-3 font-mono">
                {selectedDayEvents.map((evt) => {
                  const style = getEventTypeStyle(evt.eventType);
                  const Icon = style.icon;

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setEventDetailModal(evt)}
                      className={`p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] border-l-4 ${style.badge} flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-blue-400 transition-colors`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400">
                          <Icon size={14} />
                          <span>{evt.timeSlot} • {evt.eventType}</span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{evt.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Building2 size={12} className="text-purple-500 shrink-0" />
                          <span>{evt.property} ({evt.client})</span>
                        </p>
                      </div>

                      <Button onClick={() => setEventDetailModal(evt)} variant="outline" size="sm" icon={Eye}>
                        Details
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. AGENDA VIEW MODE */}
        {viewMode === "agenda" && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#334155]">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-blue-500" /> Chronological Agenda Feed
              </h2>
              <span className="text-xs font-mono text-slate-400 font-bold">
                Showing {filteredEvents.length} Events
              </span>
            </div>

            <div className="space-y-4 font-mono">
              {filteredEvents.map((evt) => {
                const style = getEventTypeStyle(evt.eventType);
                const Icon = style.icon;

                return (
                  <div
                    key={evt.id}
                    onClick={() => setEventDetailModal(evt)}
                    className={`p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-blue-400 transition-colors`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.badge}`}>
                          <Icon size={11} className="inline mr-1" /> {evt.eventType}
                        </span>
                        <span className="text-slate-400 font-bold">{evt.date} • {evt.timeSlot}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{evt.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{evt.property} • Client: {evt.client}</p>
                    </div>

                    <Button onClick={() => setEventDetailModal(evt)} variant="secondary" size="sm" icon={Eye}>
                      Inspect
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL 1: EVENT DETAIL MODAL */}
        <AnimatePresence>
          {eventDetailModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEventDetailModal(null)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-lg w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">{eventDetailModal.id} • {eventDetailModal.eventType}</span>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{eventDetailModal.title}</h2>
                  </div>
                  <button onClick={() => setEventDetailModal(null)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <p className="text-slate-400 uppercase font-bold text-[10px]">Property & Client Account</p>
                    <p className="text-slate-900 dark:text-white font-extrabold text-sm flex items-center gap-1.5">
                      <Building2 size={15} className="text-purple-500" /> {eventDetailModal.property}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold">Client: {eventDetailModal.client}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <div>
                      <span className="text-slate-400 uppercase block text-[10px]">Time Slot</span>
                      <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-sm block mt-1">{eventDetailModal.timeSlot} ({eventDetailModal.date})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[10px]">Location</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold text-xs block mt-1">{eventDetailModal.location}</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                    <p className="text-slate-400 uppercase font-bold text-[10px]">Audit Instructions & Notes</p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{eventDetailModal.notes}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end">
                  <Button onClick={() => setEventDetailModal(null)} variant="secondary" size="sm">Close</Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MODAL 2: SCHEDULE EVENT MODAL */}
        <AnimatePresence>
          {scheduleModalOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setScheduleModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <PlusCircle size={20} className="text-blue-500" /> Schedule Calendar Event
                  </h2>
                  <button onClick={() => setScheduleModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <form onSubmit={handleScheduleEventSubmit} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Event Title *</label>
                    <input type="text" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="E.g. Site Visit & Title Deed Audit" required className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 uppercase font-bold mb-1">Event Type</label>
                      <select value={eventForm.eventType} onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold focus:outline-none">
                        <option value="Property Visits">Property Visits</option>
                        <option value="Meetings">Meetings</option>
                        <option value="Deadlines">Deadlines</option>
                        <option value="Due Diligence Reviews">Due Diligence Reviews</option>
                        <option value="Report Submission Dates">Report Submission Dates</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold mb-1">Day of Month (Aug)</label>
                      <input type="number" min={1} max={31} value={eventForm.dayNumber} onChange={(e) => setEventForm({ ...eventForm, dayNumber: Number(e.target.value), date: `2026-08-${String(e.target.value).padStart(2, '0')}` })} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Time Slot</label>
                    <input type="text" value={eventForm.timeSlot} onChange={(e) => setEventForm({ ...eventForm, timeSlot: e.target.value })} placeholder="E.g. 10:00 AM - 11:30 AM" className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Location / Video Link</label>
                    <input type="text" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Audit Notes</label>
                    <textarea rows={3} value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} placeholder="Add audit notes or meeting agenda..." className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setScheduleModalOpen(false)} variant="secondary" size="sm">Cancel</Button>
                    <Button type="submit" variant="primary" size="sm">Confirm Schedule</Button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default AgentCalendar;
