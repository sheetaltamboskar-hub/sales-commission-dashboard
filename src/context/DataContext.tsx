import React, { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import type {
  Employee, Quota, Achievement, Deal, Milestone,
  CommissionRate, RegionPolicy, CliffPolicy, KickerPolicy,
  DualCredit, Clawback,
} from '@/types'
import * as sheets from '@/services/googleSheets'
import * as mock from '@/services/mockData'

const USE_MOCK = !import.meta.env.VITE_GOOGLE_SHEETS_ID ||
  import.meta.env.VITE_GOOGLE_SHEETS_ID === 'your_google_spreadsheet_id_here'

interface DataContextValue {
  employees: Employee[]
  quotas: Quota[]
  achievements: Achievement[]
  deals: Deal[]
  milestones: Milestone[]
  commissionRates: CommissionRate[]
  regionPolicies: RegionPolicy[]
  cliffPolicies: CliffPolicy[]
  kickerPolicies: KickerPolicy[]
  dualCredits: DualCredit[]
  clawbacks: Clawback[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

async function fetchAll() {
  if (USE_MOCK) {
    return {
      employees: mock.mockEmployees,
      quotas: mock.mockQuotas,
      achievements: mock.mockAchievements,
      deals: mock.mockDeals,
      milestones: mock.mockMilestones,
      commissionRates: mock.mockCommissionRates,
      regionPolicies: mock.mockRegionPolicies,
      cliffPolicies: mock.mockCliffPolicies,
      kickerPolicies: mock.mockKickerPolicies,
      dualCredits: mock.mockDualCredits,
      clawbacks: mock.mockClawbacks,
    }
  }

  const [
    employees, quotas, achievements, deals, milestones,
    commissionRates, regionPolicies, cliffPolicies, kickerPolicies,
    dualCredits, clawbacks,
  ] = await Promise.all([
    sheets.fetchEmployees(),
    sheets.fetchQuotas(),
    sheets.fetchAchievements(),
    sheets.fetchDeals(),
    sheets.fetchMilestones(),
    sheets.fetchCommissionRates(),
    sheets.fetchRegionPolicies(),
    sheets.fetchCliffPolicies(),
    sheets.fetchKickerPolicies(),
    sheets.fetchDualCredits(),
    sheets.fetchClawbacks(),
  ])

  return {
    employees, quotas, achievements, deals, milestones,
    commissionRates, regionPolicies, cliffPolicies, kickerPolicies,
    dualCredits, clawbacks,
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-data'],
    queryFn: fetchAll,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  const value: DataContextValue = {
    employees: data?.employees ?? [],
    quotas: data?.quotas ?? [],
    achievements: data?.achievements ?? [],
    deals: data?.deals ?? [],
    milestones: data?.milestones ?? [],
    commissionRates: data?.commissionRates ?? [],
    regionPolicies: data?.regionPolicies ?? [],
    cliffPolicies: data?.cliffPolicies ?? [],
    kickerPolicies: data?.kickerPolicies ?? [],
    dualCredits: data?.dualCredits ?? [],
    clawbacks: data?.clawbacks ?? [],
    isLoading,
    isError,
    refetch,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
