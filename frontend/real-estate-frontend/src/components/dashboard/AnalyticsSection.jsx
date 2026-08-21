import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, PieChart as PieIcon, Layers } from "lucide-react";
import { getAllProperties } from "../../services/propertyService";

function AnalyticsSection() {
  const [timeRange, setTimeRange] = useState("6m");
  const [riskData, setRiskData] = useState([
    { name: "Low Risk (0-34)", value: 70, color: "#10B981" },
    { name: "Medium Risk (35-69)", value: 20, color: "#F59E0B" },
    { name: "High Risk (70-100)", value: 10, color: "#EF4444" },
  ]);
  const [trendData, setTrendData] = useState([
    { month: "Jan", searches: 120, reports: 40 },
    { month: "Feb", searches: 180, reports: 65 },
    { month: "Mar", searches: 240, reports: 90 },
    { month: "Apr", searches: 310, reports: 120 },
    { month: "May", searches: 280, reports: 110 },
    { month: "Jun", searches: 390, reports: 160 },
    { month: "Jul", searches: 480, reports: 210 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProperties(0, 100)
      .then((res) => {
        const props = res?.data?.content || res?.data || [];
        if (Array.isArray(props) && props.length > 0) {
          let low = 0;
          let med = 0;
          let high = 0;

          props.forEach((p) => {
            const score = p.riskScore || (p.riskStatus === "HIGH" ? 75 : p.riskStatus === "MEDIUM" ? 45 : 15);
            if (score >= 70) high++;
            else if (score >= 35) med++;
            else low++;
          });

          setRiskData([
            { name: "Low Risk (0-34)", value: low || 1, color: "#10B981" },
            { name: "Medium Risk (35-69)", value: med || 1, color: "#F59E0B" },
            { name: "High Risk (70-100)", value: high || 1, color: "#EF4444" },
          ]);
        }
      })
      .catch((err) => console.error("Failed to load real backend chart statistics", err))
      .finally(() => setLoading(false));
  }, []);

  const propertyCategoryData = [
    { category: "Commercial Office", count: 450, avgScore: 22 },
    { category: "Multi-Family Residential", count: 380, avgScore: 18 },
    { category: "Industrial & Warehouse", count: 210, avgScore: 35 },
    { category: "Retail & Shopping", count: 120, avgScore: 28 },
    { category: "Land & Development", count: 80, avgScore: 42 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600 dark:text-cyan-400" />
            Executive Portfolio Analytics & Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Interactive Recharts data visualization covering property search velocity, report volume, and risk profiles.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl border border-slate-200 dark:border-[#334155]">
          {["1m", "3m", "6m", "1y"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === range
                  ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-cyan-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Property Search & Report Generation Velocity (8 Cols) */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              Monthly Property Search Trends & Report Completion Output
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              +38% completion rate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area type="monotone" dataKey="searches" name="Searches" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSearches)" />
                <Area type="monotone" dataKey="reports" name="Reports" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Vector Distribution Donut (4 Cols) */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon size={16} className="text-amber-500" />
              Properties by Risk Level
            </h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Property Categories Audit Count (12 Cols) */}
        <div className="lg:col-span-12 glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers size={16} className="text-purple-500" />
              Property Category Portfolio Audits & Risk Distribution
            </h3>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Audited Assets" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avgScore" name="Avg Risk Score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AnalyticsSection;

