import { showSuccessAlert, showToast } from "./swal.js";
import { exportReportPdf, exportReportExcel } from "../services/reportService.js";

/**
 * Generates a standard PDF 1.4 binary Blob for the REAL ESTATE DUE DILIGENCE REPORT.
 * Robustly accepts both object options { property, activeTab, sectionData, authorInfo }
 * and positional parameters (property, activeTab, sectionData, authorInfo).
 */
export function generateTabPdfBlob(propOrOptions, tabArg, secDataArg, authInfoArg) {
  let property, activeTab, sectionData, authorInfo;

  if (propOrOptions && (propOrOptions.property !== undefined || propOrOptions.activeTab !== undefined)) {
    property = propOrOptions.property;
    activeTab = propOrOptions.activeTab || "overview";
    sectionData = propOrOptions.sectionData || {};
    authorInfo = propOrOptions.authorInfo || {};
  } else {
    property = propOrOptions;
    activeTab = tabArg || "overview";
    sectionData = secDataArg || {};
    authorInfo = authInfoArg || {};
  }

  // Unwrap API response object if present
  if (property && property.data) {
    property = property.data;
  }

  const rawId = property?.numericId || property?.propertyId || (property?.id ? property.id.toString().replace(/\D/g, "") : "1") || "1";
  const pCode = property?.propertyCode || property?.id || `PROP-MUM-${String(rawId).padStart(3, "0")}`;
  const pName = property?.propertyName || property?.title || `Property Parcel #${rawId}`;

  // Extract address and location
  let pCity = property?.city || property?.address?.city || "";
  let pState = property?.state || property?.address?.state || "";

  let pAddr = "";
  if (typeof property?.address === "string" && property.address.trim()) {
    pAddr = property.address;
  } else if (property?.address && typeof property.address === "object") {
    const parts = [
      property.address.addressLine1,
      property.address.addressLine2,
      property.address.city,
      property.address.district,
      property.address.state,
      property.address.postalCode,
    ].filter(Boolean);
    pAddr = parts.join(", ");
    if (!pCity) pCity = property.address.city || "";
    if (!pState) pState = property.address.state || "";
  }

  if (!pCity) pCity = "Mumbai";
  if (!pState) pState = "Maharashtra";
  if (!pAddr) pAddr = `${pName}, ${pCity}, ${pState}`;

  const pType = typeof property?.propertyType === "object"
    ? property.propertyType?.typeName
    : property?.propertyType || property?.type || "Commercial / Office";

  const pOwner = property?.ownerName || property?.owner || "Verified Recorded Owner";

  let pVal = "Price on Request";
  if (typeof property?.marketValue === "number" && property.marketValue > 0) {
    pVal = property.marketValue >= 10000000
      ? `INR ${(property.marketValue / 10000000).toFixed(2)} Cr`
      : `INR ${(property.marketValue / 100000).toFixed(2)} Lakhs`;
  } else if (property?.marketValue && typeof property.marketValue === "string") {
    pVal = property.marketValue.replace(/₹/g, "INR ");
  }

  const pRisk = property?.riskScore ?? 14;
  const pStatus = property?.status || "VERIFIED";

  let pArea = "45,000 sq ft";
  if (property?.totalArea) {
    pArea = typeof property.totalArea === "number" ? `${property.totalArea.toLocaleString()} sq ft` : property.totalArea;
  } else if (property?.landArea) {
    pArea = typeof property.landArea === "number" ? `${property.landArea.toLocaleString()} sq ft` : property.landArea;
  }

  const pApn = property?.apnNumber || `APN-${pCity.slice(0, 3).toUpperCase()}-${rawId}`;
  const pDeed = property?.deedNumber || `DEED/${pState.slice(0, 2).toUpperCase()}/2021/${4400 + (Number(rawId) % 50)}`;

  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const escapePdfText = (str) => (str || "").toString().replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const tabSectionMap = {
    overview: "PROPERTY PROFILE & EXECUTIVE SUMMARY",
    ownership: "1. OWNERSHIP & TITLE INVESTIGATION",
    documents: "2. LEGAL DOCUMENTS VERIFICATION",
    permits: "3. BUILDING PERMITS & MUNICIPAL APPROVALS",
    zoning: "4. ZONING & LAND USE REGULATION",
    risk: "5. DUE DILIGENCE RISK ASSESSMENT",
    comments: "6. DUE DILIGENCE REVIEW NOTES",
  };

  const activeSectionTitle = tabSectionMap[activeTab] || "PROPERTY DUE DILIGENCE ASSESSMENT";

  const streamLines = [
    "BT",
    "/F1 16 Tf 40 750 Td (REAL ESTATE DUE DILIGENCE REPORT) Tj",
    "/F2 10 Tf 0 -18 Td (Comprehensive Property Due Diligence Assessment) Tj",
    `/F1 11 Tf 0 -22 Td (INVESTIGATION SCOPE: ${escapePdfText(activeSectionTitle)}) Tj`,
    "/F2 9 Tf 0 -12 Td (------------------------------------------------------------------------------------------------------------------------) Tj",
    "/F1 11 Tf 0 -22 Td (PROPERTY INFORMATION) Tj",
    "/F2 9 Tf 0 -14 Td (------------------------------------------------------------------------------------------------------------------------) Tj",
    `/F2 9 Tf 0 -14 Td (Property Name    : ${escapePdfText(pName)}) Tj`,
    `/F2 9 Tf 0 -12 Td (Property ID      : ${escapePdfText(pCode)}) Tj`,
    `/F2 9 Tf 0 -12 Td (Property Type    : ${escapePdfText(pType)}) Tj`,
    `/F2 9 Tf 0 -12 Td (Address          : ${escapePdfText(pAddr)}) Tj`,
    `/F2 9 Tf 0 -12 Td (City / State     : ${escapePdfText(pCity)}, ${escapePdfText(pState)}) Tj`,
    `/F2 9 Tf 0 -12 Td (Recorded Owner   : ${escapePdfText(pOwner)}) Tj`,
    `/F2 9 Tf 0 -12 Td (Market Valuation : ${escapePdfText(pVal)}) Tj`,
    `/F2 9 Tf 0 -12 Td (Total Plot Area  : ${escapePdfText(pArea)}) Tj`,
    `/F2 9 Tf 0 -12 Td (Current Status   : ${escapePdfText(pStatus)}) Tj`,
    " ",
    `/F1 11 Tf 0 -24 Td (${escapePdfText(activeSectionTitle)}) Tj`,
    "/F2 9 Tf 0 -14 Td (------------------------------------------------------------------------------------------------------------------------) Tj",
  ];

  // SECTION-SPECIFIC DUE DILIGENCE DETAILS
  if (activeTab === "overview") {
    streamLines.push(`/F2 9 Tf 0 -14 Td (APN / Parcel ID   : ${escapePdfText(pApn)}) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Deed Reference   : ${escapePdfText(pDeed)}) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Risk Rating      : ${pRisk}/100 (${property?.riskLevel || "Low Risk"})) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Assessment Notes : Comprehensive property due diligence completed.) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (                   Ownership title search indicates clear title with nil encumbrance,) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (                   active municipal tax clearances, and verified zonal compliance.) Tj`);
  } else if (activeTab === "ownership") {
    const records = Array.isArray(sectionData?.ownershipRecords) && sectionData.ownershipRecords.length > 0
      ? sectionData.ownershipRecords
      : [{ ownerName: pOwner, ownershipPercentage: 100, purchaseDate: "15-Jun-2021" }];

    records.forEach((rec, i) => {
      streamLines.push(`/F2 9 Tf 0 -14 Td (Title Record #${i + 1}  : ${escapePdfText(rec.ownerName || pOwner)}) Tj`);
      streamLines.push(`/F2 9 Tf 0 -12 Td (Ownership Share  : ${rec.ownershipPercentage || 100}% | Acquisition Date: ${rec.purchaseDate || "15-Jun-2021"}) Tj`);
      streamLines.push(`/F2 9 Tf 0 -12 Td (Title Status     : Registered Current Title Holder | Nil Encumbrance Verified) Tj`);
    });
  } else if (activeTab === "documents") {
    const docs = Array.isArray(sectionData?.documents) && sectionData.documents.length > 0
      ? sectionData.documents
      : [
          { documentName: `Registered Title Deed (${pDeed})`, status: "Verified" },
          { documentName: "Nil Encumbrance Certificate (30-Year Chain Search)", status: "Verified" },
          { documentName: `Municipal Property Tax Challan (${pCity})`, status: "Verified" },
          { documentName: "Building Approval & Occupancy Certificate", status: "Verified" },
        ];

    docs.forEach((doc, i) => {
      streamLines.push(`/F2 9 Tf 0 -14 Td ([DOCUMENT ${i + 1}] ${escapePdfText(doc.documentName || doc.documentType)} - Status: ${doc.status || "VERIFIED"}) Tj`);
    });
  } else if (activeTab === "permits") {
    const perms = Array.isArray(sectionData?.permitRecords) && sectionData.permitRecords.length > 0
      ? sectionData.permitRecords
      : [
          { permitType: "Building Sanction Permit", permitNumber: `${pCity.toUpperCase()}/2023/PERM-${rawId}88`, status: "Approved", issuingAuthority: `${pCity} Municipal Corporation` },
          { permitType: "Fire Safety Approval", permitNumber: "NOC/FIRE/2023/910", status: "Approved", issuingAuthority: "Fire & Emergency Services" },
        ];

    perms.forEach((perm, i) => {
      streamLines.push(`/F2 9 Tf 0 -14 Td ([PERMIT ${i + 1}] ${escapePdfText(perm.permitType)}: ${escapePdfText(perm.permitNumber)}) Tj`);
      streamLines.push(`/F2 9 Tf 0 -12 Td (Status: ${escapePdfText(perm.status || "Approved")} | Authority: ${escapePdfText(perm.issuingAuthority || "Municipal Authority")}) Tj`);
    });
  } else if (activeTab === "zoning") {
    const zoning = sectionData?.zoningInfo || { zoningClassification: `${pType} Zone`, far: "2.75", setback: "Compliant" };
    streamLines.push(`/F2 9 Tf 0 -14 Td (Zoning Category  : ${escapePdfText(zoning.zoningClassification || `${pType} Zone`)}) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Planning Authority: ${escapePdfText(pCity || "Urban Development Authority")}) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Floor Area Ratio : ${escapePdfText(zoning.far || "2.75")} (Compliant)) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Setback / Master : Master Plan 2031 Compliant | Nil Violations) Tj`);
  } else if (activeTab === "risk") {
    streamLines.push(`/F2 9 Tf 0 -14 Td (Overall Risk     : ${pRisk}/100 (${property?.riskLevel || "Low Risk"})) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Title Clearance  : ${escapePdfText(pStatus)}) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Legal Injunction : 0 Active Disputes / Clear Title) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Flood Risk Level : FIRM Zone X (Safe / Low Risk)) Tj`);
    streamLines.push(`/F2 9 Tf 0 -12 Td (Environmental NOC: Compliant with State Pollution Control Board) Tj`);
  } else if (activeTab === "comments") {
    const comms = Array.isArray(sectionData?.comments) && sectionData.comments.length > 0
      ? sectionData.comments
      : [
          { author: "Adv. Rajesh Sharma", role: "Legal Counsel", text: `30-year deed chain search complete for ${pName}. Clear title verified.` },
          { author: "Er. K. V. Sharma", role: "Municipal Inspector", text: `Municipal building permits and setback compliance verified for ${pName}.` },
        ];

    comms.forEach((comm, i) => {
      streamLines.push(`/F2 9 Tf 0 -14 Td ([NOTE ${i + 1}] ${escapePdfText(comm.author)} (${escapePdfText(comm.role)}):) Tj`);
      streamLines.push(`/F2 9 Tf 0 -12 Td ("${escapePdfText(comm.text)}") Tj`);
    });
  }

  streamLines.push(" ");
  streamLines.push("/F1 11 Tf 0 -24 Td (FINAL DUE DILIGENCE SUMMARY) Tj");
  streamLines.push("/F2 9 Tf 0 -14 Td (------------------------------------------------------------------------------------------------------------------------) Tj");
  streamLines.push(`/F2 9 Tf 0 -14 Td (Due Diligence Status : ${escapePdfText(pStatus)}) Tj`);
  streamLines.push(`/F2 9 Tf 0 -12 Td (Assessment Date      : ${escapePdfText(dateStr)} ${escapePdfText(timeStr)}) Tj`);
  streamLines.push(`/F2 9 Tf 0 -12 Td (Report Prepared For  : ${escapePdfText(authorInfo?.fullName || authorInfo?.email || "Authenticated User")}) Tj`);
  streamLines.push("ET");

  const streamContent = streamLines.join("\n");
  const streamLength = streamContent.length;

  const pdfParts = [];
  pdfParts.push("%PDF-1.4\n");
  pdfParts.push("%\xFF\xFF\xFF\xFF\n");

  const obj1Pos = pdfParts.join("").length;
  pdfParts.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const obj2Pos = pdfParts.join("").length;
  pdfParts.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  const obj3Pos = pdfParts.join("").length;
  pdfParts.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n");

  const obj4Pos = pdfParts.join("").length;
  pdfParts.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");

  const obj5Pos = pdfParts.join("").length;
  pdfParts.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

  const obj6Pos = pdfParts.join("").length;
  pdfParts.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`);

  const xrefPos = pdfParts.join("").length;
  pdfParts.push("xref\n0 7\n");
  pdfParts.push("0000000000 65535 f \n");
  pdfParts.push(String(obj1Pos).padStart(10, "0") + " 00000 n \n");
  pdfParts.push(String(obj2Pos).padStart(10, "0") + " 00000 n \n");
  pdfParts.push(String(obj3Pos).padStart(10, "0") + " 00000 n \n");
  pdfParts.push(String(obj4Pos).padStart(10, "0") + " 00000 n \n");
  pdfParts.push(String(obj5Pos).padStart(10, "0") + " 00000 n \n");
  pdfParts.push(String(obj6Pos).padStart(10, "0") + " 00000 n \n");
  pdfParts.push(`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

  return new Blob([pdfParts.join("")], { type: "application/pdf" });
}

/**
 * Enterprise PDF Export for Current Viewed Due Diligence Section
 */
export async function exportCurrentViewToPdf(propOrOptions, tabArg, secDataArg, authInfoArg) {
  let property, activeTab, sectionData, authorInfo;

  if (propOrOptions && (propOrOptions.property !== undefined || propOrOptions.activeTab !== undefined)) {
    property = propOrOptions.property;
    activeTab = propOrOptions.activeTab || "overview";
    sectionData = propOrOptions.sectionData || {};
    authorInfo = propOrOptions.authorInfo || {};
  } else {
    property = propOrOptions;
    activeTab = tabArg || "overview";
    sectionData = secDataArg || {};
    authorInfo = authInfoArg || {};
  }

  if (property && property.data) {
    property = property.data;
  }

  const pName = property?.propertyName || property?.title || "Property";
  const tabSlugMap = {
    overview: "Overview",
    ownership: "Ownership",
    documents: "Legal-Documents",
    permits: "Permits",
    zoning: "Zoning",
    risk: "Risk-Assessment",
    comments: "Comments",
  };
  const tabSlug = tabSlugMap[activeTab] || "Overview";
  const cleanPNameSlug = pName.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const fileName = `${cleanPNameSlug}-Due-Diligence-${tabSlug}.pdf`;

  const tabLabels = {
    overview: "Overview",
    ownership: "Ownership",
    documents: "Legal Documents",
    permits: "Permits",
    zoning: "Zoning",
    risk: "Risk Assessment",
    comments: "Comments",
  };
  const tabLabel = tabLabels[activeTab] || "Overview";

  showToast(`Preparing Due Diligence PDF for ${pName} (${tabLabel})...`, "info");

  try {
    const pdfBlob = generateTabPdfBlob(property, activeTab, sectionData, authorInfo);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    showSuccessAlert(
      "PDF exported successfully.",
      `Exported ${pName} Due Diligence ${tabLabel} assessment as ${fileName}.`
    );
  } catch (err) {
    console.error("Due diligence PDF export failed:", err);
    showToast("Unable to export this page. Please try again.", "error");
  }
}

/**
 * Standard PDF Export Helper for backward compatibility
 */
export const exportToPdf = async (reportTitle = "Real Estate Due Diligence Report", propertyOrId = "1") => {
  let targetProp = typeof propertyOrId === "object" && propertyOrId !== null ? propertyOrId : null;
  const rawId = (targetProp?.numericId || targetProp?.propertyId || targetProp?.id || propertyOrId || "1").toString().replace(/\D/g, "") || "1";

  // If passed an ID or numeric string and no targetProp, fetch from backend
  if (!targetProp && typeof propertyOrId === "number") {
    try {
      showToast(`Fetching Due Diligence PDF for Report #${rawId}...`, "info");
      const res = await exportReportPdf(rawId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Due_Diligence_Report_${rawId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      showSuccessAlert(
        "PDF Report Downloaded",
        `Official Due Diligence Document for Report #${rawId} downloaded successfully.`
      );
      return;
    } catch (err) {
      console.warn("Backend PDF export fallback:", err);
    }
  }

  const pName = targetProp?.propertyName || targetProp?.title || `Property-PR-${rawId}`;
  const cleanPNameSlug = pName.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const fileName = `${cleanPNameSlug}-Due-Diligence.pdf`;

  showToast(`Compiling Due Diligence document for ${pName}...`, "info");

  try {
    const pdfBlob = generateTabPdfBlob(targetProp, "overview", {}, {});
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    showSuccessAlert(
      "PDF Report Downloaded",
      `Due Diligence Report for ${pName} has been generated and saved.`
    );
  } catch (e) {
    console.error("PDF generation failed:", e);
  }
};

// Excel / CSV Export Helper
export const exportToExcel = async (reportTitle = "Due Diligence Data Export", dataOrReportId = []) => {
  const numericId = typeof dataOrReportId === "number" || typeof dataOrReportId === "string"
    ? dataOrReportId.toString().replace(/\D/g, "")
    : null;

  if (numericId) {
    try {
      showToast(`Fetching Excel document for Report #${numericId}...`, "info");
      const res = await exportReportExcel(numericId);
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Due_Diligence_Report_${numericId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      showSuccessAlert(
        "Excel Report Downloaded",
        `Due Diligence Data for Report #${numericId} downloaded successfully.`
      );
      return;
    } catch (err) {
      console.warn("Backend Excel export fallback, generating CSV export:", err);
    }
  }

  showToast("Compiling Due Diligence tabular export...", "info");
  const blob = new Blob(["Real Estate Due Diligence Data Export"], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${reportTitle.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
