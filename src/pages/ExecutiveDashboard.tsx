import { useState, useMemo } from 'react'
import {
  Target, TrendingUp, DollarSign, AlertTriangle,
  CheckCircle, Clock, BarChart3, Users,
} from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { KpiCard } from '@/components/KpiCard'
import { FilterBar } from '@/components/FilterBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/context/DataContext'
import { calcEmployeeCommission, calcExecutiveKPIs } from '@/services/commissionEngine'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { FilterState } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement)

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
}

export function ExecutiveDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    fy: 'FY26', quarter: 'Q3', employeeId: 'all', region: 'all',
  })

  const { employees, quotas, achievements, deals, milestones, commissionRates,
    regionPolicies, cliffPolicies, kickerPolicies, dualCredits, clawbacks, isLoading } = useData()

  const results = useMemo(() => {
    const filtered = filters.region === 'all'
      ? employees
      : employees.filter(e => e.region === filters.region)

    return filtered.map(emp =>
      calcEmployeeCommission(
        emp, filters.fy, filters.quarter, quotas, achievements, deals,
        commissionRates, regionPolicies, cliffPolicies, kickerPolicies,
        milestones, dualCredits, clawbacks,
      )
    )
  }, [employees, quotas, achievements, deals, commissionRates, regionPolicies,
    cliffPolicies, kickerPolicies, milestones, dualCredits, clawbacks, filters])

  const kpis = useMemo(() => calcExecutiveKPIs(results, clawbacks), [results, clawbacks])

  const totalGMRR = useMemo(() =>
    deals.reduce((s, d) => s + d.mrr + d.setupFee + d.poc, 0), [deals])

  // Chart data
  const regionData = useMemo(() => {
    const regions = ['India', 'SEA', 'ANZ', 'US', 'LATAM']
    return {
      labels: regions,
      datasets: [
        {
          label: 'Achievement %',
          data: regions.map(region => {
            const empIds = employees.filter(e => e.region === region).map(e => e.employeeId)
            const r = results.filter(r => empIds.includes(r.employeeId))
            if (!r.length) return 0
            const avg = r.reduce((s, x) => s + x.achievementPercent, 0) / r.length
            return Math.round(avg)
          }),
          backgroundColor: '#0F4C81',
          borderRadius: 4,
        },
      ],
    }
  }, [results, employees])

  const quarterTrendData = useMemo(() => ({
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Achievement',
        data: ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
          return achievements
            .filter(a => a.fy === filters.fy && a.quarter === q)
            .reduce((s, a) => s + a.achievement, 0)
        }),
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34,197,94,0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Target',
        data: ['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
          return quotas
            .filter(qt => qt.fy === filters.fy)
            .reduce((s, qt) => {
              const vals = [qt.q1Target, qt.q2Target, qt.q3Target, qt.q4Target]
              return s + vals[i]
            }, 0)
        }),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245,158,11,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }), [achievements, quotas, filters.fy])

  const eligibilityData = useMemo(() => {
    const eligible = results.filter(r => r.eligible).length
    const notEligible = results.length - eligible
    return {
      labels: ['Eligible', 'Below Cliff'],
      datasets: [{
        data: [eligible, notEligible],
        backgroundColor: ['#22C55E', '#EF4444'],
        borderWidth: 0,
      }],
    }
  }, [results])

  const commissionData = useMemo(() => ({
    labels: ['Paid', 'Pending', 'Clawback'],
    datasets: [{
      label: 'Commission ($)',
      data: [kpis.paidCommission, kpis.pendingCommission, kpis.clawbackAmount],
      backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
      borderRadius: 4,
    }],
  }), [kpis])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <p className="text-muted-foreground text-sm">Commission performance overview</p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Target" value={formatCurrency(kpis.totalTarget)} icon={Target} color="blue" />
        <KpiCard title="Total Achievement" value={formatCurrency(kpis.totalAchievement)} icon={TrendingUp} color="green" />
        <KpiCard title="Achievement %" value={formatPercent(kpis.achievementPercent)} icon={BarChart3} color="purple" />
        <KpiCard title="Total GMRR" value={formatCurrency(totalGMRR)} icon={DollarSign} color="green" />
        <KpiCard title="Eligible Commission" value={formatCurrency(kpis.eligibleCommission)} icon={CheckCircle} color="green" />
        <KpiCard title="Paid Commission" value={formatCurrency(kpis.paidCommission)} icon={DollarSign} color="blue" />
        <KpiCard title="Pending Commission" value={formatCurrency(kpis.pendingCommission)} icon={Clock} color="yellow" />
        <KpiCard title="Clawback Amount" value={formatCurrency(kpis.clawbackAmount)} icon={AlertTriangle} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Achievement vs Target Trend ({filters.fy})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <Line data={quarterTrendData} options={CHART_OPTS} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Region Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <Bar data={regionData} options={CHART_OPTS} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliff Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-48 w-48">
              <Doughnut data={eligibilityData} options={CHART_OPTS} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commission Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <Bar data={commissionData} options={CHART_OPTS} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employee Summary — {filters.fy} {filters.quarter}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {['Employee', 'Region', 'Level', 'Target', 'Achievement', 'Ach %', 'Eligible', 'Commission'].map(h => (
                    <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.employeeId} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{r.employeeName}</td>
                    <td className="py-2 px-3">{r.region}</td>
                    <td className="py-2 px-3">{r.salesLevel}</td>
                    <td className="py-2 px-3">{formatCurrency(r.cumTarget)}</td>
                    <td className="py-2 px-3">{formatCurrency(r.cumAchievement)}</td>
                    <td className="py-2 px-3">
                      <span className={r.achievementPercent >= r.cliff ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {formatPercent(r.achievementPercent)}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.eligible ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium">{formatCurrency(r.finalCommission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
