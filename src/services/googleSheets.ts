import type {
  Employee, Quota, Achievement, Deal, Milestone,
  CommissionRate, RegionPolicy, CliffPolicy, KickerPolicy,
  DualCredit, Clawback,
} from '@/types'

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string
const SHEETS_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID as string
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

async function fetchRange<T>(sheet: string, transform: (rows: string[][]) => T[]): Promise<T[]> {
  const url = `${BASE}/${SHEETS_ID}/values/${encodeURIComponent(sheet)}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${sheet}: ${res.statusText}`)
  const data = await res.json()
  const rows: string[][] = data.values ?? []
  if (rows.length < 2) return []
  return transform(rows.slice(1)) // skip header row
}

function num(v: string | undefined): number {
  return parseFloat(v ?? '0') || 0
}
function bool(v: string | undefined): boolean {
  return (v ?? '').toLowerCase() === 'true' || v === '1' || (v ?? '').toLowerCase() === 'yes'
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export async function fetchEmployees(): Promise<Employee[]> {
  const sheet = import.meta.env.VITE_SHEET_EMPLOYEE ?? 'Employee_Master'
  return fetchRange<Employee>(sheet, rows =>
    rows.map(r => ({
      employeeId: r[0] ?? '',
      employeeName: r[1] ?? '',
      region: r[2] ?? '',
      salesLevel: r[3] ?? '',
      doj: r[4] ?? '',
      manager: r[5] ?? '',
      active: bool(r[6]),
    })).filter(e => e.employeeId)
  )
}

export async function fetchQuotas(): Promise<Quota[]> {
  const sheet = import.meta.env.VITE_SHEET_QUOTA ?? 'Quota_Master'
  return fetchRange<Quota>(sheet, rows =>
    rows.map(r => ({
      fy: r[0] ?? '',
      employeeId: r[1] ?? '',
      q1Target: num(r[2]),
      q2Target: num(r[3]),
      q3Target: num(r[4]),
      q4Target: num(r[5]),
    })).filter(q => q.employeeId)
  )
}

export async function fetchAchievements(): Promise<Achievement[]> {
  const sheet = import.meta.env.VITE_SHEET_ACHIEVEMENT ?? 'Achievement_Master'
  return fetchRange<Achievement>(sheet, rows =>
    rows.map(r => ({
      fy: r[0] ?? '',
      employeeId: r[1] ?? '',
      quarter: (r[2] ?? 'Q1') as Achievement['quarter'],
      achievement: num(r[3]),
    })).filter(a => a.employeeId)
  )
}

export async function fetchDeals(): Promise<Deal[]> {
  const sheet = import.meta.env.VITE_SHEET_DEAL ?? 'Deal_Master'
  return fetchRange<Deal>(sheet, rows =>
    rows.map(r => ({
      dealId: r[0] ?? '',
      sapId: r[1] ?? '',
      customer: r[2] ?? '',
      region: r[3] ?? '',
      currency: r[4] ?? 'USD',
      mrr: num(r[5]),
      setupFee: num(r[6]),
      poc: num(r[7]),
      contractMonths: num(r[8]),
      contractYears: num(r[9]),
      annualAdvance: bool(r[10]),
      bookingMonth: r[11] ?? '',
      liveDate: r[12] ?? '',
      status: (r[13] ?? 'Active') as Deal['status'],
    })).filter(d => d.dealId)
  )
}

export async function fetchMilestones(): Promise<Milestone[]> {
  const sheet = import.meta.env.VITE_SHEET_MILESTONE ?? 'Milestone_Master'
  return fetchRange<Milestone>(sheet, rows =>
    rows.map(r => ({
      dealId: r[0] ?? '',
      setupFeePaid: bool(r[1]),
      firstBilling: bool(r[2]),
      goLive: bool(r[3]),
      milestoneDate: r[4] ?? '',
    })).filter(m => m.dealId)
  )
}

export async function fetchCommissionRates(): Promise<CommissionRate[]> {
  const sheet = import.meta.env.VITE_SHEET_COMMISSION_RATE ?? 'Commission_Rate_Master'
  return fetchRange<CommissionRate>(sheet, rows =>
    rows.map(r => ({
      salesLevel: r[0] ?? '',
      rate: num(r[1]),
      currency: r[2] ?? 'USD',
    })).filter(c => c.salesLevel)
  )
}

export async function fetchRegionPolicies(): Promise<RegionPolicy[]> {
  const sheet = import.meta.env.VITE_SHEET_REGION_POLICY ?? 'Region_Policy_Master'
  return fetchRange<RegionPolicy>(sheet, rows =>
    rows.map(r => ({
      fy: r[0] ?? '',
      region: r[1] ?? '',
      factor: num(r[2]),
    })).filter(p => p.region)
  )
}

export async function fetchCliffPolicies(): Promise<CliffPolicy[]> {
  const sheet = import.meta.env.VITE_SHEET_CLIFF ?? 'Cliff_Master'
  return fetchRange<CliffPolicy>(sheet, rows =>
    rows.map(r => ({
      fy: r[0] ?? '',
      cliff: num(r[1]),
    })).filter(c => c.fy)
  )
}

export async function fetchKickerPolicies(): Promise<KickerPolicy[]> {
  const sheet = import.meta.env.VITE_SHEET_KICKER ?? 'Kicker_Master'
  return fetchRange<KickerPolicy>(sheet, rows =>
    rows.map(r => ({
      fy: r[0] ?? '',
      contractYears: num(r[1]),
      annualAdvance: bool(r[2]),
      kicker: num(r[3]),
    }))
  )
}

export async function fetchDualCredits(): Promise<DualCredit[]> {
  const sheet = import.meta.env.VITE_SHEET_DUAL_CREDIT ?? 'Dual_Credit_Master'
  return fetchRange<DualCredit>(sheet, rows =>
    rows.map(r => ({
      dealId: r[0] ?? '',
      employee1: r[1] ?? '',
      employee2: r[2] ?? '',
    })).filter(d => d.dealId)
  )
}

export async function fetchClawbacks(): Promise<Clawback[]> {
  const sheet = import.meta.env.VITE_SHEET_CLAWBACK ?? 'Clawback_Master'
  return fetchRange<Clawback>(sheet, rows =>
    rows.map(r => ({
      dealId: r[0] ?? '',
      employee: r[1] ?? '',
      paidAmount: num(r[2]),
      clawbackAmount: num(r[3]),
      status: (r[4] ?? 'Pending') as Clawback['status'],
    })).filter(c => c.dealId)
  )
}

// ─── Write helpers (requires OAuth token) ────────────────────────────────────

export async function appendRow(sheet: string, values: (string | number | boolean)[], token: string): Promise<void> {
  const url = `${BASE}/${SHEETS_ID}/values/${encodeURIComponent(sheet)}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ values: [values] }),
  })
  if (!res.ok) throw new Error(`Failed to append to ${sheet}`)
}

export async function updateRow(
  sheet: string,
  rowIndex: number,
  values: (string | number | boolean)[],
  token: string,
): Promise<void> {
  const range = `${sheet}!A${rowIndex}`
  const url = `${BASE}/${SHEETS_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED&key=${API_KEY}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ values: [values] }),
  })
  if (!res.ok) throw new Error(`Failed to update ${sheet} row ${rowIndex}`)
}
