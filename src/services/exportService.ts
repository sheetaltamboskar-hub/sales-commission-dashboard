import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CommissionResult, DealCommission, LeaderboardEntry } from '@/types'
import { formatCurrency, formatPercent } from '@/lib/utils'

// ─── Excel Export ─────────────────────────────────────────────────────────────

export function exportToExcel(data: Record<string, unknown>[], filename: string): void {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportCommissionResultsExcel(results: CommissionResult[]): void {
  const rows = results.map(r => ({
    'Employee ID': r.employeeId,
    'Employee Name': r.employeeName,
    Region: r.region,
    'Sales Level': r.salesLevel,
    FY: r.fy,
    Quarter: r.quarter,
    'Cum Target': r.cumTarget,
    'Cum Achievement': r.cumAchievement,
    'Achievement %': r.achievementPercent.toFixed(1),
    Cliff: r.cliff,
    Eligible: r.eligible ? 'Yes' : 'No',
    'Final Commission': r.finalCommission,
    'Paid Commission': r.paidCommission,
    'Pending Commission': r.pendingCommission,
    'Clawback Amount': r.clawbackAmount,
  }))
  exportToExcel(rows as Record<string, unknown>[], 'commission_results')
}

export function exportDealCommissionsExcel(deals: DealCommission[]): void {
  const rows = deals.map(d => ({
    'Deal ID': d.dealId,
    Customer: d.customer,
    Region: d.region,
    Employee: d.employeeName,
    MRR: d.mrr,
    'Setup Fee': d.setupFee,
    POC: d.poc,
    GMRR: d.gmrr,
    'Quota Retirement': d.quotaRetirement,
    'Contract Years': d.contractYears,
    'Annual Advance': d.annualAdvance ? 'Yes' : 'No',
    'Kicker %': d.kicker,
    'Base Commission': d.baseCommission,
    'Regional Commission': d.regionalCommission,
    'After Kicker': d.commissionAfterKicker,
    'Milestone 1 (25%)': d.milestone1,
    'Milestone 2 (75%)': d.milestone2,
    'Final Commission': d.finalCommission,
    'M1 Unlocked': d.milestone1Unlocked ? 'Yes' : 'No',
    'M2 Unlocked': d.milestone2Unlocked ? 'Yes' : 'No',
    Status: d.status,
  }))
  exportToExcel(rows as Record<string, unknown>[], 'deal_commissions')
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

export function exportCommissionPDF(results: CommissionResult[], title: string): void {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text(title, 14, 15)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [[
      'Employee', 'Region', 'FY', 'Q', 'Target', 'Achievement',
      'Ach %', 'Eligible', 'Commission', 'Paid', 'Pending',
    ]],
    body: results.map(r => [
      r.employeeName,
      r.region,
      r.fy,
      r.quarter,
      formatCurrency(r.cumTarget),
      formatCurrency(r.cumAchievement),
      formatPercent(r.achievementPercent),
      r.eligible ? 'Yes' : 'No',
      formatCurrency(r.finalCommission),
      formatCurrency(r.paidCommission),
      formatCurrency(r.pendingCommission),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 76, 129] },
  })

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`)
}

export function exportLeaderboardPDF(entries: LeaderboardEntry[]): void {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Sales Leaderboard', 14, 15)

  autoTable(doc, {
    startY: 25,
    head: [['Rank', 'Employee', 'Region', 'Level', 'Achievement %', 'Commission']],
    body: entries.map(e => [
      e.rank,
      e.employeeName,
      e.region,
      e.salesLevel,
      formatPercent(e.achievementPercent),
      formatCurrency(e.commission),
    ]),
    headStyles: { fillColor: [15, 76, 129] },
  })

  doc.save('leaderboard.pdf')
}
