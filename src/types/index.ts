// ─── Master Data Models ───────────────────────────────────────────────────────

export interface Employee {
  employeeId: string
  employeeName: string
  region: string
  salesLevel: string
  doj: string
  manager: string
  active: boolean
}

export interface Quota {
  fy: string
  employeeId: string
  q1Target: number
  q2Target: number
  q3Target: number
  q4Target: number
}

export interface Achievement {
  fy: string
  employeeId: string
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  achievement: number
}

export interface Deal {
  dealId: string
  sapId: string
  customer: string
  region: string
  currency: string
  mrr: number
  setupFee: number
  poc: number
  contractMonths: number
  contractYears: number
  annualAdvance: boolean
  bookingMonth: string
  liveDate: string
  status: 'Active' | 'Churned' | 'Pending'
}

export interface Milestone {
  dealId: string
  setupFeePaid: boolean
  firstBilling: boolean
  goLive: boolean
  milestoneDate: string
}

export interface CommissionRate {
  salesLevel: string
  rate: number
  currency: string
}

export interface RegionPolicy {
  fy: string
  region: string
  factor: number
}

export interface CliffPolicy {
  fy: string
  cliff: number
}

export interface KickerPolicy {
  fy: string
  contractYears: number
  annualAdvance: boolean
  kicker: number
}

export interface DualCredit {
  dealId: string
  employee1: string
  employee2: string
}

export interface Clawback {
  dealId: string
  employee: string
  paidAmount: number
  clawbackAmount: number
  status: 'Pending' | 'Recovered' | 'Waived'
}

// ─── Calculated Models ────────────────────────────────────────────────────────

export interface CommissionResult {
  employeeId: string
  employeeName: string
  region: string
  salesLevel: string
  fy: string
  quarter: string
  cumTarget: number
  cumAchievement: number
  achievementPercent: number
  cliff: number
  eligible: boolean
  baseCommission: number
  regionFactor: number
  regionalCommission: number
  kickerRate: number
  commissionAfterKicker: number
  milestone1: number
  milestone2: number
  finalCommission: number
  paidCommission: number
  pendingCommission: number
  clawbackAmount: number
}

export interface DealCommission {
  dealId: string
  customer: string
  region: string
  employeeId: string
  employeeName: string
  mrr: number
  setupFee: number
  poc: number
  gmrr: number
  quotaRetirement: number
  contractYears: number
  annualAdvance: boolean
  kicker: number
  baseCommission: number
  regionalCommission: number
  commissionAfterKicker: number
  milestone1: number
  milestone2: number
  finalCommission: number
  milestone1Unlocked: boolean
  milestone2Unlocked: boolean
  status: string
}

export interface LeaderboardEntry {
  rank: number
  employeeId: string
  employeeName: string
  region: string
  salesLevel: string
  achievementPercent: number
  commission: number
  gmrr: number
}

export interface ExecutiveKPIs {
  totalTarget: number
  totalAchievement: number
  achievementPercent: number
  totalGMRR: number
  eligibleCommission: number
  paidCommission: number
  pendingCommission: number
  clawbackAmount: number
}

// ─── App Models ───────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'sales'

export interface AppUser {
  id: string
  name: string
  email: string
  picture: string
  role: UserRole
  employeeId?: string
}

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface FilterState {
  fy: string
  quarter: Quarter
  employeeId: string
  region: string
}
