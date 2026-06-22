# Sales Commission Management Dashboard

A production-ready commission tracking app built with React 18 + TypeScript + Vite + Tailwind CSS, backed by Google Sheets and deployed on Vercel.

---

## Quick Start (Local Development)

### Prerequisites
- [Node.js 18+](https://nodejs.org/) — download and install if not already present

### 1. Install dependencies
```bash
cd sales-commission-dashboard
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in your Google credentials (see section below). The app works in **Demo Mode** without any credentials — just leave the defaults.

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:5173

---

## Google Sheets Setup (for live data)

### Step 1 — Create a Google Cloud project
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable **Google Sheets API** and **Google Drive API**

### Step 2 — Create credentials
1. Create an **OAuth 2.0 Client ID** (Web Application type)
   - Authorised JavaScript origins: `http://localhost:5173` (dev) and your Vercel URL (prod)
2. Create an **API Key** and restrict it to Sheets API

### Step 3 — Create the Google Sheet
Create a single spreadsheet with these tab names:

| Tab name | Columns |
|---|---|
| `Employee_Master` | Employee ID, Employee Name, Region, Sales Level, DOJ, Manager, Active |
| `Quota_Master` | FY, Employee ID, Q1 Target, Q2 Target, Q3 Target, Q4 Target |
| `Achievement_Master` | FY, Employee ID, Quarter, Achievement |
| `Deal_Master` | Deal ID, SAP ID, Customer, Region, Currency, MRR, Setup Fee, POC, Contract Months, Contract Years, Annual Advance, Booking Month, Live Date, Status |
| `Milestone_Master` | Deal ID, Setup Fee Paid, First Billing, Go Live, Milestone Date |
| `Commission_Rate_Master` | Sales Level, Rate, Currency |
| `Region_Policy_Master` | FY, Region, Factor |
| `Cliff_Master` | FY, Cliff |
| `Kicker_Master` | FY, Contract Years, Annual Advance, Kicker |
| `Dual_Credit_Master` | Deal ID, Employee 1, Employee 2 |
| `Clawback_Master` | Deal ID, Employee, Paid Amount, Clawback Amount, Status |

Share the sheet with **Anyone with the link → Viewer** for read operations.

### Step 4 — Fill in `.env`
```env
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSy...
VITE_GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

---

## Deploy to Vercel

### Option A — Vercel CLI
```bash
npm install -g vercel
npm run build
vercel --prod
```
When prompted, set the same environment variables in the Vercel dashboard.

### Option B — GitHub + Vercel
1. Push this folder to a GitHub repository
2. Go to https://vercel.com/new → Import Git Repository
3. Framework: **Vite**; Root directory: `/`
4. Add the three environment variables
5. Deploy

---

## Commission Engine — Key Formulas

| Formula | Logic |
|---|---|
| GMRR | MRR + Setup Fee + POC |
| Quota Retirement | MRR + (Setup Fee / Contract Months) |
| Cliff FY25/FY26 | 30% / 40% — below cliff → $0 commission |
| Base Commission | Quota Retirement × Employee Rate |
| Regional Commission | Base × Region Factor |
| Kicker 2yr / 3yr | +4% / +8%; Annual Advance + 2yr+ → +10% |
| Milestone 1 | 25% when Setup Fee Paid |
| Milestone 2 | 75% when First Billing AND Go Live |
| Dual Credit | Full achievement credited to both reps independently |
| Clawback | Full paid amount recovered when deal churns |

---

## Demo Mode
If no Google credentials are configured, the app auto-logs in as **Admin** and loads realistic mock data for all 8 sheets. All calculations, charts, exports and filtering work identically to live mode.

---

## Project Structure
```
src/
├── types/          # TypeScript models for all 11 sheets
├── services/
│   ├── commissionEngine.ts   # All calculation logic
│   ├── googleSheets.ts       # Sheets API read/write
│   ├── exportService.ts      # Excel + PDF export
│   └── mockData.ts           # Demo data
├── context/
│   ├── AuthContext.tsx        # Google OAuth + demo login
│   ├── DataContext.tsx        # React Query data fetching
│   └── ThemeContext.tsx       # Dark mode
├── components/
│   ├── Layout.tsx             # Sidebar + topbar
│   ├── KpiCard.tsx
│   ├── FilterBar.tsx
│   └── ui/                    # ShadCN primitives
└── pages/
    ├── ExecutiveDashboard.tsx
    ├── CommissionCalculator.tsx
    ├── DealTracker.tsx
    ├── EmployeeDashboard.tsx
    ├── Leaderboard.tsx
    ├── ClawbackDashboard.tsx
    ├── AuditReport.tsx
    └── FileImport.tsx
```
