import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileCompletionCard from "../components/profile/ProfileCompletionCard";
import UserStatsGrid from "../components/profile/UserStatsGrid";
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import AccountSecurityCard from "../components/profile/AccountSecurityCard";
import SavedPropertiesCard from "../components/profile/SavedPropertiesCard";
import RecentActivityTimeline from "../components/profile/RecentActivityTimeline";
import SettingsAndPreferences from "../components/profile/SettingsAndPreferences";
import DownloadsAndDangerZone from "../components/profile/DownloadsAndDangerZone";
import { User, Shield, Sliders, Bell, Activity } from "lucide-react";
import { normalizeRole } from "../utils/roleUtils";
import { getUserProfile } from "../services/propertyService";

// THE 5 EXACT TABS REQUIRED FOR MY ACCOUNT
const ACCOUNT_TABS = [
  { id: "profile", label: "Profile", icon: User, desc: "Personal info & account profile" },
  { id: "security", label: "Security", icon: Shield, desc: "Password & security settings" },
  { id: "preferences", label: "Preferences", icon: Sliders, desc: "Theme & platform preferences" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alerts & update preferences" },
  { id: "activity", label: "Activity", icon: Activity, desc: "Recent account activity & history" },
];

function MyAccount() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const initialTabFromUrl = searchParams.get("tab");
  const isSettingsRoute =
    location.pathname.includes("/settings") || location.pathname.includes("/platform-settings");
  const defaultTab = isSettingsRoute ? "preferences" : "profile";

  const isValidTab = ACCOUNT_TABS.some((t) => t.id === initialTabFromUrl);
  const [activeTab, setActiveTab] = useState(isValidTab ? initialTabFromUrl : defaultTab);

  // Keep state synced with URL tab parameter
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && ACCOUNT_TABS.some((t) => t.id === currentTab)) {
      setActiveTab(currentTab);
    } else if (
      (location.pathname.includes("/settings") || location.pathname.includes("/platform-settings")) &&
      !currentTab
    ) {
      setActiveTab("preferences");
    }
  }, [searchParams, location]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const getInitialUser = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const derivedName =
          parsed.fullName ||
          parsed.name ||
          (parsed.firstName
            ? `${parsed.firstName} ${parsed.lastName || ""}`.trim()
            : parsed.email ? parsed.email.split("@")[0] : "User");

        return {
          name: derivedName,
          fullName: derivedName,
          firstName: parsed.firstName || derivedName.split(" ")[0] || "",
          lastName: parsed.lastName || derivedName.split(" ").slice(1).join(" ") || "",
          email: parsed.email || "",
          role: parsed.role || parsed.roleName || "Buyer",
          organization: parsed.company || parsed.organization || "",
          company: parsed.company || parsed.organization || "",
          phone: parsed.phone || parsed.phoneNumber || "",
          address: parsed.address || "",
          city: parsed.city || "",
          state: parsed.state || "",
          country: parsed.country || "India",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          createdAt: parsed.createdAt || null,
          lastLogin: parsed.lastLogin || null,
        };
      }
    } catch (e) {}

    return {
      name: "User",
      fullName: "User",
      firstName: "",
      lastName: "",
      email: "",
      role: "Buyer",
      organization: "",
      company: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      createdAt: null,
      lastLogin: null,
    };
  };

  const [profileData, setProfileData] = useState(getInitialUser);

  const [avatarUrl, setAvatarUrl] = useState(() => {
    return localStorage.getItem("user_avatar_url") || null;
  });

  useEffect(() => {
    getUserProfile()
      .then((res) => {
        if (res && res.data) {
          const u = res.data;
          const derivedName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email;
          setProfileData((prev) => ({
            ...prev,
            name: derivedName,
            fullName: derivedName,
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email,
            role: u.role || prev.role,
            phone: u.phone || prev.phone,
            organization: u.organization || prev.organization,
            company: u.organization || prev.company,
            address: u.address || prev.address,
            city: u.city || prev.city,
            state: u.state || prev.state,
            country: u.country || prev.country,
            createdAt: u.createdAt || prev.createdAt,
            lastLogin: u.lastLogin || prev.lastLogin,
          }));
        }
      })
      .catch((err) => console.warn("Failed to fetch user profile:", err));
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfileData(getInitialUser());
    };

    window.addEventListener("user_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("user_profile_updated", handleProfileUpdate);
  }, []);

  useEffect(() => {
    if (avatarUrl) {
      localStorage.setItem("user_avatar_url", avatarUrl);
    }
  }, [avatarUrl]);

  // Calculate real profile completion percentage based on actual fields
  const completionPercentage = (() => {
    const fields = [
      Boolean(profileData.name && profileData.name !== "User"),
      Boolean(profileData.email),
      Boolean(profileData.role),
      Boolean(profileData.phone),
      Boolean(profileData.organization || profileData.company),
      Boolean(profileData.city || profileData.address),
    ];
    const completedCount = fields.filter(Boolean).length;
    return Math.round((completedCount / fields.length) * 100);
  })();

  const scrollToPersonalInfo = () => {
    setActiveTab("profile");
    setTimeout(() => {
      const el = document.getElementById("personal-info-card");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* Profile Header Dossier */}
        <ProfileHeader
          profileData={profileData}
          onEditClick={scrollToPersonalInfo}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
        />

        {/* Dynamic Profile Completion Status */}
        <ProfileCompletionCard
          completionPercentage={completionPercentage}
          onCompleteClick={scrollToPersonalInfo}
        />

        {/* Real User Statistics Grid */}
        <UserStatsGrid
          userRole={profileData.role}
          completionPercentage={completionPercentage}
        />

        {/* Tab Navigation Strip */}
        <div className="white-card rounded-2xl p-1.5 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs flex flex-wrap items-center gap-1">
          {ACCOUNT_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F172A]"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "profile" && (
          <div className="space-y-8">
            <PersonalInfoCard
              profileData={profileData}
              setProfileData={setProfileData}
            />
            <SavedPropertiesCard />
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-8">
            <AccountSecurityCard
              profileData={profileData}
              setProfileData={setProfileData}
            />
            <DownloadsAndDangerZone />
          </div>
        )}

        {activeTab === "preferences" && (
          <SettingsAndPreferences />
        )}

        {activeTab === "notifications" && (
          <SettingsAndPreferences initialSection="notifications" />
        )}

        {activeTab === "activity" && (
          <RecentActivityTimeline />
        )}
      </div>
    </MainLayout>
  );
}

export default MyAccount;
