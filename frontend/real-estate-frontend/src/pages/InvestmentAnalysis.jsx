import React, { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import { getLiveActiveProperty } from "../services/liveStore";
import {
  TrendingUp,
  DollarSign,
  Percent,
  Award,
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  Lightbulb,
  FileSpreadsheet,
  Zap,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { exportToPdf } from "../utils/exportUtils";
import { showSuccessAlert } from "../utils/swal";

// Dynamic Dictionary indexed by Parcel Numeric ID (1001, 1002, 1003, 1004, 1005, 1006)
const INVESTMENT_DATA_BY_PARCEL = {
  // PR-1001: Gachibowli Tech Park Phase 2 (Hyderabad)
  "1001": {
    name: "Gachibowli Tech Park Phase 2",
    city: "Hyderabad",
    metrics: {
      roi: "16.4% p.a.",
      roiDiff: "+2.2% vs target",
      rentalYield: "7.8% p.a.",
      yieldBadge: "Grade-A Lease",
      marketGrowth: "+14.2% YoY",
      growthBadge: "Financial Dist Hub",
      priceTrend: "+12.8% p.a.",
      trendBadge: "10-Yr Track Record",
      demandIndex: "91/100",
      demandBadge: "High Tenancy",
      investmentScore: "92/100",
      scoreBadge: "AAA Institutional",
      forecastValue: "₹ 68.5 Cr",
      forecastGain: "+52% Appreciation",
    },
    valuationLineData: [
      { year: "2017", marketValue: 18.2, govtValue: 13.5 },
      { year: "2018", marketValue: 20.5, govtValue: 15.0 },
      { year: "2019", marketValue: 23.8, govtValue: 17.2 },
      { year: "2020", marketValue: 25.1, govtValue: 18.5 },
      { year: "2021", marketValue: 28.6, govtValue: 21.0 },
      { year: "2022", marketValue: 32.4, govtValue: 24.2 },
      { year: "2023", marketValue: 36.5, govtValue: 27.0 },
      { year: "2024", marketValue: 40.8, govtValue: 29.8 },
      { year: "2025", marketValue: 45.0, govtValue: 32.5 },
      { year: "2026", marketValue: 48.2, govtValue: 35.0 },
    ],
    regionalBarData: [
      { region: "Gachibowli (PR-1001)", rentalYield: 7.8, annualRoi: 16.4 },
      { region: "Jubilee Hills (PR-1002)", rentalYield: 6.5, annualRoi: 14.2 },
      { region: "Whitefield (PR-1003)", rentalYield: 8.4, annualRoi: 18.5 },
      { region: "Financial Dist (PR-1004)", rentalYield: 7.2, annualRoi: 15.1 },
      { region: "BKC Mumbai (PR-1005)", rentalYield: 8.9, annualRoi: 19.2 },
    ],
    forecastAreaData: [
      { year: "2026", rentalIncome: 3.5, capitalGain: 45.0, netCashFlow: 3.5 },
      { year: "2027", rentalIncome: 3.9, capitalGain: 50.2, netCashFlow: 7.4 },
      { year: "2028", rentalIncome: 4.3, capitalGain: 55.8, netCashFlow: 11.7 },
      { year: "2029", rentalIncome: 4.8, capitalGain: 61.9, netCashFlow: 16.5 },
      { year: "2030", rentalIncome: 5.4, capitalGain: 68.5, netCashFlow: 21.9 },
    ],
    recommendations: [
      { title: "Strong Buy & Long-Term Hold", headline: "High Tenancy Demand (91/100)", desc: "Gachibowli Financial District commercial corridor maintains 98.4% occupancy rate with 7.8% annual rental yield, generating stable cash flow." },
      { title: "5-Year Target Valuation (₹ 68.5 Cr)", headline: "+52% Projected Capital Gain", desc: "Regional metro infrastructure expansion projected to appreciate market valuation from ₹ 45 Cr to ₹ 68.5 Cr by FY 2030." },
      { title: "AAA Credit Rating Score (92/100)", headline: "Safe LTV Risk Buffer", desc: "Sanctioned mortgage LTV ratio of 69.2% provides a 15.8% equity margin against collateral default or market volatility." },
    ],
  },

  // PR-1002: Jubilee Hills Commercial Plot 36 (Hyderabad)
  "1002": {
    name: "Jubilee Hills Commercial Plot 36",
    city: "Hyderabad",
    metrics: {
      roi: "14.2% p.a.",
      roiDiff: "+1.0% vs target",
      rentalYield: "6.5% p.a.",
      yieldBadge: "Premium High Street",
      marketGrowth: "+11.8% YoY",
      growthBadge: "Luxury Retail Corridor",
      priceTrend: "+10.5% p.a.",
      trendBadge: "Prime Land Value",
      demandIndex: "78/100",
      demandBadge: "Moderate Tenancy",
      investmentScore: "86/100",
      scoreBadge: "AA+ Rating",
      forecastValue: "₹ 54.0 Cr",
      forecastGain: "+42% Appreciation",
    },
    valuationLineData: [
      { year: "2017", marketValue: 15.0, govtValue: 10.2 },
      { year: "2018", marketValue: 17.2, govtValue: 11.8 },
      { year: "2019", marketValue: 19.8, govtValue: 13.5 },
      { year: "2020", marketValue: 21.0, govtValue: 14.2 },
      { year: "2021", marketValue: 24.5, govtValue: 16.8 },
      { year: "2022", marketValue: 27.8, govtValue: 19.0 },
      { year: "2023", marketValue: 31.0, govtValue: 21.5 },
      { year: "2024", marketValue: 34.5, govtValue: 23.8 },
      { year: "2025", marketValue: 38.0, govtValue: 26.8 },
      { year: "2026", marketValue: 40.5, govtValue: 28.5 },
    ],
    regionalBarData: [
      { region: "Jubilee Hills (PR-1002)", rentalYield: 6.5, annualRoi: 14.2 },
      { region: "Banjara Hills (Local)", rentalYield: 6.2, annualRoi: 13.8 },
      { region: "Gachibowli (PR-1001)", rentalYield: 7.8, annualRoi: 16.4 },
      { region: "Madhapur (Local)", rentalYield: 7.0, annualRoi: 14.8 },
      { region: "Financial Dist (PR-1004)", rentalYield: 7.2, annualRoi: 15.1 },
    ],
    forecastAreaData: [
      { year: "2026", rentalIncome: 2.47, capitalGain: 38.0, netCashFlow: 2.47 },
      { year: "2027", rentalIncome: 2.72, capitalGain: 41.8, netCashFlow: 5.19 },
      { year: "2028", rentalIncome: 2.99, capitalGain: 45.6, netCashFlow: 8.18 },
      { year: "2029", rentalIncome: 3.29, capitalGain: 49.8, netCashFlow: 11.47 },
      { year: "2030", rentalIncome: 3.62, capitalGain: 54.0, netCashFlow: 15.09 },
    ],
    recommendations: [
      { title: "Hold & Reposition Retail Lease", headline: "High Land Value Growth", desc: "Prime Road 36 frontage ensures steady commercial land value appreciation, despite encumbrance review." },
      { title: "Target Valuation (₹ 54.0 Cr)", headline: "+42% Capital Appreciation", desc: "High-street commercial rezoning yields steady long-term capital expansion up to 2030." },
      { title: "Encumbrance Risk Mitigation", headline: "Require Special Lien Escrow", desc: "Maintain 12.5% debt service reserve escrow until pending Municipal tax audit clearance is finalized." },
    ],
  },

  // PR-1003: Whitefield Horizon Tech Campus (Bengaluru)
  "1003": {
    name: "Whitefield Horizon Tech Campus",
    city: "Bengaluru",
    metrics: {
      roi: "18.5% p.a.",
      roiDiff: "+4.5% vs target",
      rentalYield: "8.4% p.a.",
      yieldBadge: "MNC Tech Park",
      marketGrowth: "+16.5% YoY",
      growthBadge: "EPIP Tech Corridor",
      priceTrend: "+15.2% p.a.",
      trendBadge: "Top National Yield",
      demandIndex: "96/100",
      demandBadge: "Ultra-High Demand",
      investmentScore: "95/100",
      scoreBadge: "AAA Institutional",
      forecastValue: "₹ 245.0 Cr",
      forecastGain: "+48% Appreciation",
    },
    valuationLineData: [
      { year: "2017", marketValue: 65.0, govtValue: 46.0 },
      { year: "2018", marketValue: 74.0, govtValue: 52.0 },
      { year: "2019", marketValue: 86.0, govtValue: 61.0 },
      { year: "2020", marketValue: 92.0, govtValue: 66.0 },
      { year: "2021", marketValue: 108.0, govtValue: 78.0 },
      { year: "2022", marketValue: 122.0, govtValue: 88.0 },
      { year: "2023", marketValue: 138.0, govtValue: 99.0 },
      { year: "2024", marketValue: 152.0, govtValue: 109.0 },
      { year: "2025", marketValue: 165.0, govtValue: 118.0 },
      { year: "2026", marketValue: 178.0, govtValue: 127.0 },
    ],
    regionalBarData: [
      { region: "Whitefield (PR-1003)", rentalYield: 8.4, annualRoi: 18.5 },
      { region: "Outer Ring Road (Local)", rentalYield: 8.1, annualRoi: 17.8 },
      { region: "Electronic City (Local)", rentalYield: 7.9, annualRoi: 17.1 },
      { region: "BKC Mumbai (PR-1005)", rentalYield: 8.9, annualRoi: 19.2 },
      { region: "Gachibowli (PR-1001)", rentalYield: 7.8, annualRoi: 16.4 },
    ],
    forecastAreaData: [
      { year: "2026", rentalIncome: 13.86, capitalGain: 165.0, netCashFlow: 13.86 },
      { year: "2027", rentalIncome: 15.24, capitalGain: 182.0, netCashFlow: 29.10 },
      { year: "2028", rentalIncome: 16.76, capitalGain: 201.0, netCashFlow: 45.86 },
      { year: "2029", rentalIncome: 18.43, capitalGain: 222.0, netCashFlow: 64.29 },
      { year: "2030", rentalIncome: 20.27, capitalGain: 245.0, netCashFlow: 84.56 },
    ],
    recommendations: [
      { title: "Aggressive Buy & Expansion", headline: "99.1% Fortune 500 Tenancy", desc: "Whitefield IT/ITES Tech Hub features 15-year long-term leases with global tech conglomerates." },
      { title: "Target Valuation (₹ 245.0 Cr)", headline: "Top Tier Capital Yield", desc: "Namma Metro Blue Line connectivity provides strong valuation catalyst through FY 2030." },
      { title: "Zero Encumbrance Clearance", headline: "AAA Institutional Rating", desc: "Clear Title from KIAL Sub-Registrar qualifies asset for prime commercial mortgage backed securities." },
    ],
  },

  // PR-1004: Financial District Commercial Plot (Hyderabad)
  "1004": {
    name: "Financial District Commercial Plot",
    city: "Hyderabad",
    metrics: {
      roi: "15.1% p.a.",
      roiDiff: "+1.8% vs target",
      rentalYield: "7.2% p.a.",
      yieldBadge: "Corporate HQ",
      marketGrowth: "+13.0% YoY",
      growthBadge: "Nanakramguda Hub",
      priceTrend: "+11.6% p.a.",
      trendBadge: "10-Yr Stability",
      demandIndex: "88/100",
      demandBadge: "High Absorption",
      investmentScore: "90/100",
      scoreBadge: "AAA Institutional",
      forecastValue: "₹ 78.0 Cr",
      forecastGain: "+50% Appreciation",
    },
    valuationLineData: [
      { year: "2017", marketValue: 22.0, govtValue: 15.5 },
      { year: "2018", marketValue: 25.0, govtValue: 17.8 },
      { year: "2019", marketValue: 28.5, govtValue: 20.4 },
      { year: "2020", marketValue: 30.2, govtValue: 21.6 },
      { year: "2021", marketValue: 34.0, govtValue: 24.3 },
      { year: "2022", marketValue: 38.2, govtValue: 27.2 },
      { year: "2023", marketValue: 42.5, govtValue: 30.4 },
      { year: "2024", marketValue: 47.0, govtValue: 33.6 },
      { year: "2025", marketValue: 52.0, govtValue: 37.2 },
      { year: "2026", marketValue: 55.8, govtValue: 39.8 },
    ],
    regionalBarData: [
      { region: "Financial Dist (PR-1004)", rentalYield: 7.2, annualRoi: 15.1 },
      { region: "Gachibowli (PR-1001)", rentalYield: 7.8, annualRoi: 16.4 },
      { region: "Hitec City (Local)", rentalYield: 7.5, annualRoi: 15.8 },
      { region: "Kondapur (Local)", rentalYield: 6.9, annualRoi: 14.5 },
      { region: "Jubilee Hills (PR-1002)", rentalYield: 6.5, annualRoi: 14.2 },
    ],
    forecastAreaData: [
      { year: "2026", rentalIncome: 3.74, capitalGain: 52.0, netCashFlow: 3.74 },
      { year: "2027", rentalIncome: 4.11, capitalGain: 57.5, netCashFlow: 7.85 },
      { year: "2028", rentalIncome: 4.52, capitalGain: 63.8, netCashFlow: 12.37 },
      { year: "2029", rentalIncome: 4.97, capitalGain: 70.5, netCashFlow: 17.34 },
      { year: "2030", rentalIncome: 5.46, capitalGain: 78.0, netCashFlow: 22.80 },
    ],
    recommendations: [
      { title: "Buy & Long-Term Lease Hold", headline: "Nanakramguda IT Corridor", desc: "Surrounded by US multinational headquarters providing robust 7.2% annual rental yields." },
      { title: "Target Valuation (₹ 78.0 Cr)", headline: "+50% Projected Appreciation", desc: "ORR Financial District extension infrastructure supports sustained 11.6% annual valuation growth." },
      { title: "Zero Tax Lien Verification", headline: "Serilingampally Clear Title", desc: "Verified municipal tax clearance status ensures frictionless institutional debt underwriting." },
    ],
  },

  // PR-1005: BKC Prime Commercial Hub (Mumbai)
  "1005": {
    name: "BKC Prime Commercial Hub",
    city: "Mumbai",
    metrics: {
      roi: "19.2% p.a.",
      roiDiff: "+5.2% vs target",
      rentalYield: "8.9% p.a.",
      yieldBadge: "Global Financial Ctr",
      marketGrowth: "+17.8% YoY",
      growthBadge: "G-Block Premium",
      priceTrend: "+16.5% p.a.",
      trendBadge: "Highest National Rate",
      demandIndex: "98/100",
      demandBadge: "Maximum Tenancy",
      investmentScore: "98/100",
      scoreBadge: "AAA+ Sovereign Rating",
      forecastValue: "₹ 315.0 Cr",
      forecastGain: "+50% Appreciation",
    },
    valuationLineData: [
      { year: "2017", marketValue: 95.0, govtValue: 70.0 },
      { year: "2018", marketValue: 108.0, govtValue: 80.0 },
      { year: "2019", marketValue: 124.0, govtValue: 92.0 },
      { year: "2020", marketValue: 132.0, govtValue: 98.0 },
      { year: "2021", marketValue: 150.0, govtValue: 111.0 },
      { year: "2022", marketValue: 168.0, govtValue: 124.0 },
      { year: "2023", marketValue: 185.0, govtValue: 136.0 },
      { year: "2024", marketValue: 198.0, govtValue: 146.0 },
      { year: "2025", marketValue: 210.0, govtValue: 155.0 },
      { year: "2026", marketValue: 228.0, govtValue: 168.0 },
    ],
    regionalBarData: [
      { region: "BKC Mumbai (PR-1005)", rentalYield: 8.9, annualRoi: 19.2 },
      { region: "Lower Parel (Local)", rentalYield: 8.2, annualRoi: 17.5 },
      { region: "Nariman Point (Local)", rentalYield: 7.6, annualRoi: 15.4 },
      { region: "Whitefield (PR-1003)", rentalYield: 8.4, annualRoi: 18.5 },
      { region: "Gachibowli (PR-1001)", rentalYield: 7.8, annualRoi: 16.4 },
    ],
    forecastAreaData: [
      { year: "2026", rentalIncome: 18.69, capitalGain: 210.0, netCashFlow: 18.69 },
      { year: "2027", rentalIncome: 20.55, capitalGain: 232.0, netCashFlow: 39.24 },
      { year: "2028", rentalIncome: 22.60, capitalGain: 256.0, netCashFlow: 61.84 },
      { year: "2029", rentalIncome: 24.86, capitalGain: 284.0, netCashFlow: 86.70 },
      { year: "2030", rentalIncome: 27.35, capitalGain: 315.0, netCashFlow: 114.05 },
    ],
    recommendations: [
      { title: "Marquee Flagship Asset Buy", headline: "Global Financial Center BKC", desc: "Prime Bandra Kurla Complex G-Block asset commands India's highest commercial rental rates." },
      { title: "Target Valuation (₹ 315.0 Cr)", headline: "Sovereign Grade Asset Class", desc: "Bulletproof capital preservation with 16.5% historical CAGR across all market cycles." },
      { title: "Zero Tax Lien Verification", headline: "MMRDA Clear Land Audit", desc: "Full MMRDA leasehold clearance qualifies property for low-cost institutional REIT bundling." },
    ],
  },

  // PR-1006: Cyber City Office Tower (Gurugram)
  "1006": {
    name: "Cyber City Office Tower",
    city: "Gurugram",
    metrics: {
      roi: "17.4% p.a.",
      roiDiff: "+3.4% vs target",
      rentalYield: "7.9% p.a.",
      yieldBadge: "DLF Cybercity Park",
      marketGrowth: "+15.0% YoY",
      growthBadge: "Phase 2 Corridor",
      priceTrend: "+13.8% p.a.",
      trendBadge: "NCR Premier Hub",
      demandIndex: "92/100",
      demandBadge: "High Tenancy",
      investmentScore: "91/100",
      scoreBadge: "AAA Rating",
      forecastValue: "₹ 210.0 Cr",
      forecastGain: "+50% Appreciation",
    },
    valuationLineData: [
      { year: "2017", marketValue: 58.0, govtValue: 40.0 },
      { year: "2018", marketValue: 66.0, govtValue: 46.0 },
      { year: "2019", marketValue: 76.0, govtValue: 53.0 },
      { year: "2020", marketValue: 82.0, govtValue: 57.0 },
      { year: "2021", marketValue: 94.0, govtValue: 65.0 },
      { year: "2022", marketValue: 106.0, govtValue: 74.0 },
      { year: "2023", marketValue: 118.0, govtValue: 82.0 },
      { year: "2024", marketValue: 129.0, govtValue: 90.0 },
      { year: "2025", marketValue: 140.0, govtValue: 98.0 },
      { year: "2026", marketValue: 152.0, govtValue: 106.0 },
    ],
    regionalBarData: [
      { region: "Cyber City (PR-1006)", rentalYield: 7.9, annualRoi: 17.4 },
      { region: "Golf Course Rd (Local)", rentalYield: 8.3, annualRoi: 18.1 },
      { region: "Sohna Road (Local)", rentalYield: 7.1, annualRoi: 15.2 },
      { region: "BKC Mumbai (PR-1005)", rentalYield: 8.9, annualRoi: 19.2 },
      { region: "Gachibowli (PR-1001)", rentalYield: 7.8, annualRoi: 16.4 },
    ],
    forecastAreaData: [
      { year: "2026", rentalIncome: 11.06, capitalGain: 140.0, netCashFlow: 11.06 },
      { year: "2027", rentalIncome: 12.16, capitalGain: 155.0, netCashFlow: 23.22 },
      { year: "2028", rentalIncome: 13.38, capitalGain: 172.0, netCashFlow: 36.60 },
      { year: "2029", rentalIncome: 14.71, capitalGain: 190.0, netCashFlow: 51.31 },
      { year: "2030", rentalIncome: 16.18, capitalGain: 210.0, netCashFlow: 67.49 },
    ],
    recommendations: [
      { title: "Buy & Hold Commercial Campus", headline: "DLF Cyber Hub Connectivity", desc: "Direct rapid metro connectivity drives 96.5% institutional tenant retention rate." },
      { title: "Target Valuation (₹ 210.0 Cr)", headline: "+50% Capital Expansion", desc: "Gurugram commercial hub master plan supports 13.8% annual valuation growth." },
      { title: "Zero Lien Municipal Clearance", headline: "HSVP Approved Title", desc: "Fully verified Haryana Shahari Vikas Pradhikaran clearance ensures seamless financing." },
    ],
  },
};

function InvestmentAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlId = searchParams.get("id") || searchParams.get("propertyId") || localStorage.getItem("active_property_id") || "1001";
  const numericId = urlId.toString().replace(/\D/g, "") || "1001";

  const [activeId, setActiveId] = React.useState(numericId);

  React.useEffect(() => {
    setActiveId(numericId);
  }, [numericId, searchParams]);

  React.useEffect(() => {
    const handleLiveUpdate = () => {
      const storedId = (localStorage.getItem("active_property_id") || "1001").toString().replace(/\D/g, "") || "1001";
      setActiveId(storedId);
    };
    window.addEventListener("live_data_updated", handleLiveUpdate);
    window.addEventListener("storage", handleLiveUpdate);
    return () => {
      window.removeEventListener("live_data_updated", handleLiveUpdate);
      window.removeEventListener("storage", handleLiveUpdate);
    };
  }, []);

  const activeProp = getLiveActiveProperty(activeId);

  // Dynamic Dataset for the selected active parcel
  const parcelData = useMemo(() => {
    return INVESTMENT_DATA_BY_PARCEL[activeId] || INVESTMENT_DATA_BY_PARCEL["1001"];
  }, [activeId]);

  // Export PDF Report
  const handleExportInvestmentReport = () => {
    exportToPdf(`Investment_Analysis_PR-${numericId}`, {
      property: activeProp?.propertyName || parcelData.name,
      roi: parcelData.metrics.roi,
      rentalYield: parcelData.metrics.rentalYield,
      marketGrowth: parcelData.metrics.marketGrowth,
      priceTrend: parcelData.metrics.priceTrend,
      demandIndex: parcelData.metrics.demandIndex,
      investmentScore: parcelData.metrics.investmentScore,
      forecast: parcelData.metrics.forecastValue,
    });
    showSuccessAlert("Investment Audit Exported", `Generated institutional investment analysis report for PR-${numericId}`);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Financial Investment Telemetry & Capital Forecast
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
            PR-{numericId} • {parcelData.name} ({parcelData.city})
          </span>
        </div>

        {/* PROPERTY CONTEXT SWITCHER BAR */}
        <PropertyContextSwitcher currentPropertyId={numericId} />

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
              <TrendingUp size={14} /> Investment Telemetry Engine • {parcelData.city}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              📈 Investment Analysis: {parcelData.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Evaluate Return on Investment (ROI), Commercial Rental Yield, Regional Market Growth, 10-Year Price Trend, Demand Index, Credit Rating Score, and 2030 Valuation Forecasts for PR-{numericId}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button onClick={handleExportInvestmentReport} variant="primary" size="md" icon={FileSpreadsheet}>
              Export Investment Report
            </Button>
          </div>
        </div>

        {/* SECTION 1: 7 METRIC DISPLAY KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {/* 1. ROI */}
          <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-[#1E293B] border border-blue-200/80 dark:border-[#334155] border-l-4 border-l-blue-500 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-bold">1. ROI (Annual)</span>
            <h3 className="text-xl font-black text-blue-600 dark:text-cyan-400">{parcelData.metrics.roi}</h3>
            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{parcelData.metrics.roiDiff}</span>
          </div>

          {/* 2. Rental Yield */}
          <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-[#1E293B] border border-emerald-200/80 dark:border-[#334155] border-l-4 border-l-emerald-500 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-bold">2. Rental Yield</span>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">{parcelData.metrics.rentalYield}</h3>
            <span className="text-slate-400 text-[10px] font-bold">{parcelData.metrics.yieldBadge}</span>
          </div>

          {/* 3. Market Growth */}
          <div className="p-5 rounded-3xl bg-purple-50/60 dark:bg-[#1E293B] border border-purple-200/80 dark:border-[#334155] border-l-4 border-l-purple-500 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-bold">3. Market Growth</span>
            <h3 className="text-xl font-black text-purple-600 dark:text-purple-400">{parcelData.metrics.marketGrowth}</h3>
            <span className="text-purple-500 text-[10px] font-bold">{parcelData.metrics.growthBadge}</span>
          </div>

          {/* 4. Price Trend */}
          <div className="p-5 rounded-3xl bg-amber-50/60 dark:bg-[#1E293B] border border-amber-200/80 dark:border-[#334155] border-l-4 border-l-amber-500 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-bold">4. Price Trend</span>
            <h3 className="text-xl font-black text-amber-600 dark:text-amber-400">{parcelData.metrics.priceTrend}</h3>
            <span className="text-slate-400 text-[10px] font-bold">{parcelData.metrics.trendBadge}</span>
          </div>

          {/* 5. Demand Index */}
          <div className="p-5 rounded-3xl bg-cyan-50/60 dark:bg-[#1E293B] border border-cyan-200/80 dark:border-[#334155] border-l-4 border-l-cyan-500 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-bold">5. Demand Index</span>
            <h3 className="text-xl font-black text-cyan-600 dark:text-cyan-300">{parcelData.metrics.demandIndex}</h3>
            <span className="text-cyan-600 dark:text-cyan-400 text-[10px] font-bold">{parcelData.metrics.demandBadge}</span>
          </div>

          {/* 6. Investment Score */}
          <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-[#1E293B] border border-emerald-200/80 dark:border-[#334155] border-l-4 border-l-emerald-500 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-bold">6. Investment Score</span>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">{parcelData.metrics.investmentScore}</h3>
            <span className="text-emerald-500 text-[10px] font-bold">{parcelData.metrics.scoreBadge}</span>
          </div>

          {/* 7. Forecast */}
          <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-[#1E293B] border border-blue-200/80 dark:border-[#334155] border-l-4 border-l-blue-500 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-bold">7. 2030 Forecast</span>
            <h3 className="text-xl font-black text-blue-600 dark:text-cyan-400">{parcelData.metrics.forecastValue}</h3>
            <span className="text-blue-500 text-[10px] font-bold">{parcelData.metrics.forecastGain}</span>
          </div>
        </div>

        {/* SECTION 2: THE 3 CHARTS (LINE CHART, BAR CHART, AREA TREND) DYNAMICALLY RE-RENDERED FOR THE PARCEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 1. LINE CHART: 10-YEAR VALUATION & PRICE HISTORY (7 COLS) */}
          <div className="lg:col-span-7 white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider block">
                  10-YEAR APPRECIATION • PR-{activeId}
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  📈 Historical Property Valuation Line Chart (₹ Cr)
                </h2>
              </div>
              <Badge variant="success">{parcelData.metrics.priceTrend} CAGR</Badge>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer key={`res-line-${activeId}`} width="100%" height="100%">
                <LineChart data={parcelData.valuationLineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="year" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "11px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Line type="monotone" dataKey="marketValue" name="Market Value (₹ Cr)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="govtValue" name="Govt Ready Reckoner (₹ Cr)" stroke="#A855F7" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. BAR CHART: REGIONAL COMPARATIVE RENTAL YIELD & ROI (5 COLS) */}
          <div className="lg:col-span-5 white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                  REGIONAL BENCHMARK • {parcelData.city}
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  📊 Rental Yield vs Annual ROI Bar Chart (%)
                </h2>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer key={`res-bar-${activeId}`} width="100%" height="100%">
                <BarChart data={parcelData.regionalBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="region" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "11px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Bar dataKey="rentalYield" name="Rental Yield %" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="annualRoi" name="Annual ROI %" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. AREA CHART: 5-YEAR FORECASTED CUMULATIVE CASH FLOW & CAPITAL GAIN */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                CAPITAL FORECAST 2026-2030 • PR-{activeId}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                🌊 Cumulative Cash Flow & Capital Gain Area Trend (₹ Cr)
              </h2>
            </div>
            <Badge variant="success">{parcelData.metrics.forecastValue} Target Valuation</Badge>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer key={`res-area-${activeId}`} width="100%" height="100%">
              <AreaChart data={parcelData.forecastAreaData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="year" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "11px" }} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Area type="monotone" dataKey="capitalGain" name="Projected Capital Valuation (₹ Cr)" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} />
                <Area type="monotone" dataKey="netCashFlow" name="Cumulative Net Cash Flow (₹ Cr)" stroke="#10B981" fill="#10B981" fillOpacity={0.35} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 3: INVESTMENT RECOMMENDATION CARDS */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                PORTFOLIO STRATEGY • PR-{numericId}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                💡 Institutional Investment Recommendation Cards
              </h2>
            </div>
            <Badge variant="success">Active Audit Verdict</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {parcelData.recommendations.map((rec, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-bold">
                  <CheckCircle2 size={16} /> {rec.title}
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xs">{rec.headline}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {rec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default InvestmentAnalysis;
