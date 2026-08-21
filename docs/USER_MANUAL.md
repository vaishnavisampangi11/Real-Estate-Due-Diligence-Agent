# User Manual & Operational Workflow Guide

## 1. User Roles & Capabilities Matrix

The platform supports 5 specialized operational roles:

| Role | Target Persona | Core Capabilities |
| :--- | :--- | :--- |
| **Buyer** | Institutional Investors, Property Buyers | Search land registries, view 360° due diligence vectors, inspect risk ratings, download audit reports (PDF/Excel), save property watchlists. |
| **Real Estate Agent** | Listing Brokers, Advisory Consultants | Register property parcels, manage client portfolios, view live due diligence audit stages, generate customer reports. |
| **Legal Reviewer** | Title Attorneys, Legal Counsel | Audit 30-year deed chains at sub-registrar, verify encumbrances, review legal documents, seal title verdicts. |
| **Financial Officer**| Mortgage Underwriters, Banking Officers | Assess collateral valuations, analyze loan-to-value (LTV) risks, review debt-service coverage (DSCR), sanction mortgages. |
| **Administrator** | Compliance Directors, System Admins | Platform governance, view real-time audit event feeds, manage API integrations, configure system rules. |

---

## 2. End-to-End Due Diligence Demonstration Sequence

### Step 1: User Login & Role Selection
1. Navigate to `/login`.
2. Select desired role or enter credentials (`buyer@example.com` / `password123`).
3. Dashboard initializes with real PostgreSQL statistics and recent activity.

### Step 2: Property Search & Filtering
1. Click **Search Properties** or navigate to `/search`.
2. Filter by City (e.g., *Hyderabad*), Property Type (e.g., *Villa*, *Commercial*), or Price Range.
3. Observe real database records populated with instant sub-second response.

### Step 3: 360° Due Diligence Inspection
1. Click on a property card (e.g., `Gachibowli Luxury Villa` `PROP-HYD-001`).
2. Navigate across verification tabs:
   * **Title & Ownership**: Inspect registered deeds, owner names, and encumbrance certificates.
   * **Tax History**: Review municipal property tax payment receipts and assessment years.
   * **Zoning & Master Plan**: Check Floor Area Ratio (FAR) permissions and land use zoning.
   * **Environmental & Flood**: Verify FIRM flood zone categorization and State Pollution Control NOCs.
   * **Permits & Utilities**: Check municipal building permits and electrical/water connections.

### Step 4: Risk Assessment & Recommendation
1. Click **Risk Assessment** (`/risk-assessment?id=1`).
2. Review the AI Risk Engine score (e.g., `14/100 - Low Risk`) across legal, regulatory, and market dimensions.

### Step 5: Comparable Market Analysis
1. Navigate to **Comparable Properties** (`/comparables?id=1`).
2. Compare square footage rates and recent registered transaction valuations in the same micro-market.

### Step 6: Generate & Download Official Audit Certificate
1. Click **Generate Report** in the top navigation or modal.
2. Select format: **PDF Report** or **Excel Spreadsheet**.
3. Browser downloads `Due_Diligence_Report_PR-1.pdf` or `.xlsx` containing the complete cryptographic audit trail.

### Step 7: System Audit Trail & Notifications
1. Open the notification bell dropdown to review real-time alerts.
2. Navigate to **Audit Logs** to view immutable event trails.
