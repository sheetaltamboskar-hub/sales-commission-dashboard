import type {
  Employee, Quota, Achievement, Deal, Milestone,
  CommissionRate, RegionPolicy, CliffPolicy, KickerPolicy,
  DualCredit, Clawback,
} from '@/types'

export const mockEmployees: Employee[] = [
  { employeeId: 'E001', employeeName: 'Arjun Sharma', region: 'India', salesLevel: 'Sale 3', doj: '2022-01-15', manager: 'M001', active: true },
  { employeeId: 'E002', employeeName: 'Priya Patel', region: 'India', salesLevel: 'Sale 4', doj: '2021-06-01', manager: 'M001', active: true },
  { employeeId: 'E003', employeeName: 'Jake Wilson', region: 'US', salesLevel: 'Sale 5', doj: '2020-03-10', manager: 'M002', active: true },
  { employeeId: 'E004', employeeName: 'Sarah Chen', region: 'ANZ', salesLevel: 'Sale 3', doj: '2023-02-20', manager: 'M002', active: true },
  { employeeId: 'E005', employeeName: 'Ravi Kumar', region: 'SEA', salesLevel: 'Sale 4', doj: '2022-08-01', manager: 'M001', active: true },
  { employeeId: 'E006', employeeName: 'Maria Santos', region: 'LATAM', salesLevel: 'Sale 3', doj: '2023-05-15', manager: 'M003', active: true },
  { employeeId: 'E007', employeeName: 'Tom Baker', region: 'US', salesLevel: 'Sale 4', doj: '2021-11-01', manager: 'M002', active: true },
  { employeeId: 'E008', employeeName: 'Anita Nair', region: 'India', salesLevel: 'Sale 5', doj: '2019-07-01', manager: 'M001', active: true },
]

export const mockQuotas: Quota[] = [
  { fy: 'FY26', employeeId: 'E001', q1Target: 50000, q2Target: 60000, q3Target: 70000, q4Target: 80000 },
  { fy: 'FY26', employeeId: 'E002', q1Target: 40000, q2Target: 50000, q3Target: 60000, q4Target: 70000 },
  { fy: 'FY26', employeeId: 'E003', q1Target: 80000, q2Target: 90000, q3Target: 100000, q4Target: 120000 },
  { fy: 'FY26', employeeId: 'E004', q1Target: 45000, q2Target: 55000, q3Target: 65000, q4Target: 75000 },
  { fy: 'FY26', employeeId: 'E005', q1Target: 35000, q2Target: 45000, q3Target: 55000, q4Target: 65000 },
  { fy: 'FY26', employeeId: 'E006', q1Target: 30000, q2Target: 40000, q3Target: 50000, q4Target: 60000 },
  { fy: 'FY26', employeeId: 'E007', q1Target: 70000, q2Target: 80000, q3Target: 90000, q4Target: 100000 },
  { fy: 'FY26', employeeId: 'E008', q1Target: 60000, q2Target: 70000, q3Target: 80000, q4Target: 90000 },
]

export const mockAchievements: Achievement[] = [
  // E001
  { fy: 'FY26', employeeId: 'E001', quarter: 'Q1', achievement: 48000 },
  { fy: 'FY26', employeeId: 'E001', quarter: 'Q2', achievement: 65000 },
  { fy: 'FY26', employeeId: 'E001', quarter: 'Q3', achievement: 72000 },
  // E002
  { fy: 'FY26', employeeId: 'E002', quarter: 'Q1', achievement: 42000 },
  { fy: 'FY26', employeeId: 'E002', quarter: 'Q2', achievement: 38000 },
  { fy: 'FY26', employeeId: 'E002', quarter: 'Q3', achievement: 55000 },
  // E003
  { fy: 'FY26', employeeId: 'E003', quarter: 'Q1', achievement: 90000 },
  { fy: 'FY26', employeeId: 'E003', quarter: 'Q2', achievement: 95000 },
  { fy: 'FY26', employeeId: 'E003', quarter: 'Q3', achievement: 110000 },
  // E004
  { fy: 'FY26', employeeId: 'E004', quarter: 'Q1', achievement: 20000 },
  { fy: 'FY26', employeeId: 'E004', quarter: 'Q2', achievement: 50000 },
  { fy: 'FY26', employeeId: 'E004', quarter: 'Q3', achievement: 60000 },
  // E005
  { fy: 'FY26', employeeId: 'E005', quarter: 'Q1', achievement: 38000 },
  { fy: 'FY26', employeeId: 'E005', quarter: 'Q2', achievement: 48000 },
  { fy: 'FY26', employeeId: 'E005', quarter: 'Q3', achievement: 52000 },
  // E006
  { fy: 'FY26', employeeId: 'E006', quarter: 'Q1', achievement: 28000 },
  { fy: 'FY26', employeeId: 'E006', quarter: 'Q2', achievement: 35000 },
  { fy: 'FY26', employeeId: 'E006', quarter: 'Q3', achievement: 42000 },
  // E007
  { fy: 'FY26', employeeId: 'E007', quarter: 'Q1', achievement: 68000 },
  { fy: 'FY26', employeeId: 'E007', quarter: 'Q2', achievement: 82000 },
  { fy: 'FY26', employeeId: 'E007', quarter: 'Q3', achievement: 88000 },
  // E008
  { fy: 'FY26', employeeId: 'E008', quarter: 'Q1', achievement: 65000 },
  { fy: 'FY26', employeeId: 'E008', quarter: 'Q2', achievement: 75000 },
  { fy: 'FY26', employeeId: 'E008', quarter: 'Q3', achievement: 85000 },
]

export const mockDeals: Deal[] = [
  { dealId: 'D001', sapId: 'SAP001', customer: 'Acme Corp', region: 'India', currency: 'USD', mrr: 5000, setupFee: 10000, poc: 0, contractMonths: 24, contractYears: 2, annualAdvance: true, bookingMonth: '2026-01', liveDate: '2026-03-01', status: 'Active' },
  { dealId: 'D002', sapId: 'SAP002', customer: 'TechFlow Inc', region: 'US', currency: 'USD', mrr: 12000, setupFee: 25000, poc: 2000, contractMonths: 36, contractYears: 3, annualAdvance: false, bookingMonth: '2026-01', liveDate: '2026-02-15', status: 'Active' },
  { dealId: 'D003', sapId: 'SAP003', customer: 'Nexus Pty', region: 'ANZ', currency: 'AUD', mrr: 8000, setupFee: 15000, poc: 1000, contractMonths: 24, contractYears: 2, annualAdvance: false, bookingMonth: '2026-02', liveDate: '2026-04-01', status: 'Active' },
  { dealId: 'D004', sapId: 'SAP004', customer: 'Global Retail', region: 'SEA', currency: 'USD', mrr: 6500, setupFee: 12000, poc: 500, contractMonths: 12, contractYears: 1, annualAdvance: false, bookingMonth: '2026-02', liveDate: '2026-03-15', status: 'Active' },
  { dealId: 'D005', sapId: 'SAP005', customer: 'Banco Latam', region: 'LATAM', currency: 'USD', mrr: 4000, setupFee: 8000, poc: 0, contractMonths: 24, contractYears: 2, annualAdvance: true, bookingMonth: '2026-03', liveDate: '2026-05-01', status: 'Active' },
  { dealId: 'D006', sapId: 'SAP006', customer: 'MegaSoft', region: 'India', currency: 'USD', mrr: 9000, setupFee: 20000, poc: 3000, contractMonths: 36, contractYears: 3, annualAdvance: true, bookingMonth: '2026-01', liveDate: '2026-03-01', status: 'Active' },
  { dealId: 'D007', sapId: 'SAP007', customer: 'StartupXYZ', region: 'US', currency: 'USD', mrr: 3000, setupFee: 5000, poc: 0, contractMonths: 12, contractYears: 1, annualAdvance: false, bookingMonth: '2025-11', liveDate: '2026-01-01', status: 'Churned' },
]

export const mockMilestones: Milestone[] = [
  { dealId: 'D001', setupFeePaid: true, firstBilling: true, goLive: true, milestoneDate: '2026-03-15' },
  { dealId: 'D002', setupFeePaid: true, firstBilling: false, goLive: false, milestoneDate: '2026-02-20' },
  { dealId: 'D003', setupFeePaid: false, firstBilling: false, goLive: false, milestoneDate: '' },
  { dealId: 'D004', setupFeePaid: true, firstBilling: true, goLive: true, milestoneDate: '2026-04-01' },
  { dealId: 'D005', setupFeePaid: false, firstBilling: false, goLive: false, milestoneDate: '' },
  { dealId: 'D006', setupFeePaid: true, firstBilling: true, goLive: true, milestoneDate: '2026-03-10' },
  { dealId: 'D007', setupFeePaid: true, firstBilling: true, goLive: true, milestoneDate: '2026-01-15' },
]

export const mockCommissionRates: CommissionRate[] = [
  { salesLevel: 'Sale 3', rate: 70, currency: 'USD' },
  { salesLevel: 'Sale 4', rate: 100, currency: 'USD' },
  { salesLevel: 'Sale 5', rate: 150, currency: 'USD' },
]

export const mockRegionPolicies: RegionPolicy[] = [
  { fy: 'FY26', region: 'India', factor: 18 },
  { fy: 'FY26', region: 'SEA', factor: 18 },
  { fy: 'FY26', region: 'ANZ', factor: 76.5 },
  { fy: 'FY26', region: 'US', factor: 76.5 },
  { fy: 'FY26', region: 'LATAM', factor: 76.5 },
  { fy: 'FY25', region: 'India', factor: 18 },
  { fy: 'FY25', region: 'SEA', factor: 18 },
  { fy: 'FY25', region: 'ANZ', factor: 76.5 },
  { fy: 'FY25', region: 'US', factor: 76.5 },
  { fy: 'FY25', region: 'LATAM', factor: 76.5 },
]

export const mockCliffPolicies: CliffPolicy[] = [
  { fy: 'FY25', cliff: 30 },
  { fy: 'FY26', cliff: 40 },
]

export const mockKickerPolicies: KickerPolicy[] = [
  { fy: 'FY26', contractYears: 2, annualAdvance: false, kicker: 4 },
  { fy: 'FY26', contractYears: 3, annualAdvance: false, kicker: 8 },
  { fy: 'FY26', contractYears: 2, annualAdvance: true, kicker: 10 },
  { fy: 'FY25', contractYears: 2, annualAdvance: false, kicker: 4 },
  { fy: 'FY25', contractYears: 3, annualAdvance: false, kicker: 8 },
]

export const mockDualCredits: DualCredit[] = [
  { dealId: 'D001', employee1: 'E001', employee2: 'E002' },
  { dealId: 'D006', employee1: 'E001', employee2: 'E008' },
]

export const mockClawbacks: Clawback[] = [
  { dealId: 'D007', employee: 'E003', paidAmount: 5000, clawbackAmount: 5000, status: 'Pending' },
]
