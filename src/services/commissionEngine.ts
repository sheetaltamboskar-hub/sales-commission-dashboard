import type {
  Employee, Quota, Achievement, Deal, Milestone,
  CommissionRate, RegionPolicy, CliffPolicy, KickerPolicy,
  DualCredit, Clawback, CommissionResult, DealCommission,
  LeaderboardEntry, ExecutiveKPIs, Quarter,
} from '@/types'

// ─── GMRR ────────────────────────────────────────────────────────────────────

export function calcGMRR(deal: Deal): number {
  return deal.mrr + deal.setupFee + deal.poc
}

// ─── Quota Retirement ─────────────────────────────────────────────────────────

export function calcQuotaRetirement(deal: Deal): number {
  const months = deal.contractMonths || 1
  return deal.mrr + deal.setupFee / months
}

// ─── Cumulative Target ────────────────────────────────────────────────────────

export function calcCumTarget(quota: Quota, quarter: Quarter): number {
  switch (quarter) {
    case 'Q1': return quota.q1Target
    case 'Q2': return quota.q1Target + quota.q2Target
    case 'Q3': return quota.q1Target + quota.q2Target + quota.q3Target
    case 'Q4': return quota.q1Target + quota.q2Target + quota.q3Target + quota.q4Target
  }
}

// ─── Cumulative Achievement ───────────────────────────────────────────────────

export function calcCumAchievement(achievements: Achievement[], quarter: Quarter): number {
  const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']
  const upTo = quarters.indexOf(quarter)
  return achievements
    .filter(a => quarters.indexOf(a.quarter as Quarter) <= upTo)
    .reduce((sum, a) => sum + a.achievement, 0)
}

// ─── Achievement % ────────────────────────────────────────────────────────────

export function calcAchievementPercent(cumAchievement: number, cumTarget: number): number {
  if (cumTarget === 0) return 0
  return (cumAchievement / cumTarget) * 100
}

// ─── Cliff Check ─────────────────────────────────────────────────────────────

export function isEligible(achievementPercent: number, cliff: number): boolean {
  return achievementPercent >= cliff
}

// ─── Kicker Rate ─────────────────────────────────────────────────────────────

export function calcKickerRate(
  deal: Deal,
  kickers: KickerPolicy[],
  fy: string,
): number {
  const fyKickers = kickers.filter(k => k.fy === fy)

  // FY26 special: annual advance + 2+ years = 10%
  if (deal.annualAdvance && deal.contractYears >= 2) {
    const special = fyKickers.find(k => k.annualAdvance && k.contractYears >= 2)
    if (special) return special.kicker
  }

  // Standard multi-year
  const match = fyKickers
    .filter(k => !k.annualAdvance && deal.contractYears >= k.contractYears)
    .sort((a, b) => b.contractYears - a.contractYears)[0]

  return match ? match.kicker : 0
}

// ─── Full Deal Commission ─────────────────────────────────────────────────────

export function calcDealCommission(
  deal: Deal,
  employee: Employee,
  rates: CommissionRate[],
  regionPolicies: RegionPolicy[],
  kickers: KickerPolicy[],
  milestones: Milestone[],
  fy: string,
): DealCommission {
  const rate = rates.find(r => r.salesLevel === employee.salesLevel)?.rate ?? 0
  const regionPolicy = regionPolicies.find(
    r => r.fy === fy && r.region === employee.region,
  )?.factor ?? 0

  const gmrr = calcGMRR(deal)
  const quotaRetirement = calcQuotaRetirement(deal)
  const baseCommission = quotaRetirement * (rate / 100)
  const regionalCommission = baseCommission * (regionPolicy / 100)
  const kickerRate = calcKickerRate(deal, kickers, fy)
  const commissionAfterKicker = regionalCommission * (1 + kickerRate / 100)
  const finalCommission = commissionAfterKicker

  const milestone = milestones.find(m => m.dealId === deal.dealId)
  const milestone1Unlocked = milestone?.setupFeePaid ?? false
  const milestone2Unlocked = (milestone?.firstBilling && milestone?.goLive) ?? false

  const milestone1 = finalCommission * 0.25
  const milestone2 = finalCommission * 0.75

  return {
    dealId: deal.dealId,
    customer: deal.customer,
    region: deal.region,
    employeeId: employee.employeeId,
    employeeName: employee.employeeName,
    mrr: deal.mrr,
    setupFee: deal.setupFee,
    poc: deal.poc,
    gmrr,
    quotaRetirement,
    contractYears: deal.contractYears,
    annualAdvance: deal.annualAdvance,
    kicker: kickerRate,
    baseCommission,
    regionalCommission,
    commissionAfterKicker,
    milestone1,
    milestone2,
    finalCommission,
    milestone1Unlocked,
    milestone2Unlocked,
    status: deal.status,
  }
}

// ─── Employee Commission Summary ──────────────────────────────────────────────

export function calcEmployeeCommission(
  employee: Employee,
  fy: string,
  quarter: Quarter,
  quotas: Quota[],
  achievements: Achievement[],
  deals: Deal[],
  rates: CommissionRate[],
  regionPolicies: RegionPolicy[],
  cliffPolicies: CliffPolicy[],
  kickers: KickerPolicy[],
  milestones: Milestone[],
  dualCredits: DualCredit[],
  clawbacks: Clawback[],
): CommissionResult {
  const quota = quotas.find(q => q.fy === fy && q.employeeId === employee.employeeId)
  const cumTarget = quota ? calcCumTarget(quota, quarter) : 0

  const empAchievements = achievements.filter(
    a => a.fy === fy && a.employeeId === employee.employeeId,
  )
  const cumAchievement = calcCumAchievement(empAchievements, quarter)
  const achievementPercent = calcAchievementPercent(cumAchievement, cumTarget)

  const cliffPolicy = cliffPolicies.find(c => c.fy === fy)
  const cliff = cliffPolicy?.cliff ?? 30
  const eligible = isEligible(achievementPercent, cliff)

  // Deals attributed to this employee (including dual credit)
  const dualDealIds = dualCredits
    .filter(d => d.employee1 === employee.employeeId || d.employee2 === employee.employeeId)
    .map(d => d.dealId)

  const empDeals = deals.filter(d => {
    const isDual = dualDealIds.includes(d.dealId)
    // For non-dual deals we'd need a deal-employee mapping; using dual credit only for now
    return isDual
  })

  let totalFinal = 0
  let milestone1Total = 0
  let milestone2Total = 0

  if (eligible) {
    for (const deal of empDeals) {
      const dc = calcDealCommission(deal, employee, rates, regionPolicies, kickers, milestones, fy)
      totalFinal += dc.finalCommission
      if (dc.milestone1Unlocked) milestone1Total += dc.milestone1
      if (dc.milestone2Unlocked) milestone2Total += dc.milestone2
    }
  }

  const paidCommission = milestone1Total + milestone2Total

  const clawbackAmount = clawbacks
    .filter(c => c.employee === employee.employeeId)
    .reduce((s, c) => s + c.clawbackAmount, 0)

  const pendingCommission = Math.max(0, totalFinal - paidCommission)

  const rate = rates.find(r => r.salesLevel === employee.salesLevel)?.rate ?? 0
  const regionFactor = regionPolicies.find(r => r.fy === fy && r.region === employee.region)?.factor ?? 0

  return {
    employeeId: employee.employeeId,
    employeeName: employee.employeeName,
    region: employee.region,
    salesLevel: employee.salesLevel,
    fy,
    quarter,
    cumTarget,
    cumAchievement,
    achievementPercent,
    cliff,
    eligible,
    baseCommission: 0,
    regionFactor,
    regionalCommission: 0,
    kickerRate: 0,
    commissionAfterKicker: totalFinal,
    milestone1: milestone1Total,
    milestone2: milestone2Total,
    finalCommission: totalFinal,
    paidCommission,
    pendingCommission,
    clawbackAmount,
  }
}

// ─── Executive KPIs ───────────────────────────────────────────────────────────

export function calcExecutiveKPIs(results: CommissionResult[], clawbacks: Clawback[]): ExecutiveKPIs {
  const totalTarget = results.reduce((s, r) => s + r.cumTarget, 0)
  const totalAchievement = results.reduce((s, r) => s + r.cumAchievement, 0)
  const achievementPercent = totalTarget > 0 ? (totalAchievement / totalTarget) * 100 : 0
  const totalGMRR = 0 // computed separately from deals
  const eligibleCommission = results.filter(r => r.eligible).reduce((s, r) => s + r.finalCommission, 0)
  const paidCommission = results.reduce((s, r) => s + r.paidCommission, 0)
  const pendingCommission = results.reduce((s, r) => s + r.pendingCommission, 0)
  const clawbackAmount = clawbacks.reduce((s, c) => s + c.clawbackAmount, 0)

  return {
    totalTarget,
    totalAchievement,
    achievementPercent,
    totalGMRR,
    eligibleCommission,
    paidCommission,
    pendingCommission,
    clawbackAmount,
  }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export function buildLeaderboard(results: CommissionResult[]): LeaderboardEntry[] {
  return results
    .sort((a, b) => b.achievementPercent - a.achievementPercent)
    .map((r, i) => ({
      rank: i + 1,
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      region: r.region,
      salesLevel: r.salesLevel,
      achievementPercent: r.achievementPercent,
      commission: r.finalCommission,
      gmrr: 0,
    }))
}
