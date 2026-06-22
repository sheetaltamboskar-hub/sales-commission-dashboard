import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { FilterBar } from '@/components/FilterBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/context/DataContext'
import { calcEmployeeCommission } from '@/services/commissionEngine'
import { exportCommissionResultsExcel, exportCommissionPDF } from '@/services/exportService'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { FilterState } from '@/types'

export function CommissionCalculator() {
  const [filters, setFilters] = useState<FilterState>({
    fy: 'FY26', quarter: 'Q3', employeeId: 'all', region: 'all',
  })

  const { employees, quotas, achievements, deals, milestones, commissionRates,
    regionPolicies, cliffPolicies, kickerPolicies, dualCredits, clawbacks } = useData()

  const results = useMemo(() => {
    let filtered = employees
    if (filters.region !== 'all') filtered = filtered.filter(e => e.region === filters.region)
    if (filters.employeeId !== 'all') filtered = filtered.filter(e => e.employeeId === filters.employeeId)

    return filtered.map(emp =>
      calcEmployeeCommission(
        emp, filters.fy, filters.quarter, quotas, achievements, deals,
        commissionRates, regionPolicies, cliffPolicies, kickerPolicies,
        milestones, dualCredits, clawbacks,
      )
    )
  }, [employees, quotas, achievements, deals, commissionRates, regionPolicies,
    cliffPolicies, kickerPolicies, milestones, dualCredits, clawbacks, filters])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commission Calculator</h1>
          <p className="text-muted-foreground text-sm">View and calculate commissions by FY, Quarter and employee</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCommissionResultsExcel(results)}>
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCommissionPDF(results, `Commission ${filters.fy} ${filters.quarter}`)}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} showEmployee />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Commission Results — {filters.fy} {filters.quarter}
            <span className="ml-2 text-sm font-normal text-muted-foreground">({results.length} employees)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {[
                    'Employee', 'Region', 'Level', 'Cum Target', 'Cum Achievement',
                    'Ach %', 'Cliff', 'Eligible', 'Final Commission', 'Paid', 'Pending', 'Clawback',
                  ].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.employeeId} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-medium">{r.employeeName}</td>
                    <td className="py-3 px-3">{r.region}</td>
                    <td className="py-3 px-3">{r.salesLevel}</td>
                    <td className="py-3 px-3">{formatCurrency(r.cumTarget)}</td>
                    <td className="py-3 px-3">{formatCurrency(r.cumAchievement)}</td>
                    <td className="py-3 px-3">
                      <span className={r.achievementPercent >= r.cliff ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {formatPercent(r.achievementPercent)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{formatPercent(r.cliff)}</td>
                    <td className="py-3 px-3">
                      <Badge variant={r.eligible ? 'success' : 'destructive'}>
                        {r.eligible ? 'Eligible' : 'Ineligible'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-semibold">{formatCurrency(r.finalCommission)}</td>
                    <td className="py-3 px-3 text-green-600">{formatCurrency(r.paidCommission)}</td>
                    <td className="py-3 px-3 text-yellow-600">{formatCurrency(r.pendingCommission)}</td>
                    <td className="py-3 px-3 text-red-600">{r.clawbackAmount > 0 ? `-${formatCurrency(r.clawbackAmount)}` : '—'}</td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-muted-foreground">No results match the selected filters.</td>
                  </tr>
                )}
              </tbody>
              {results.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 font-bold bg-muted/20">
                    <td className="py-3 px-3" colSpan={3}>Total</td>
                    <td className="py-3 px-3">{formatCurrency(results.reduce((s, r) => s + r.cumTarget, 0))}</td>
                    <td className="py-3 px-3">{formatCurrency(results.reduce((s, r) => s + r.cumAchievement, 0))}</td>
                    <td className="py-3 px-3">
                      {formatPercent(results.reduce((s, r) => s + r.cumAchievement, 0) /
                        Math.max(results.reduce((s, r) => s + r.cumTarget, 0), 1) * 100)}
                    </td>
                    <td colSpan={2} />
                    <td className="py-3 px-3">{formatCurrency(results.reduce((s, r) => s + r.finalCommission, 0))}</td>
                    <td className="py-3 px-3 text-green-600">{formatCurrency(results.reduce((s, r) => s + r.paidCommission, 0))}</td>
                    <td className="py-3 px-3 text-yellow-600">{formatCurrency(results.reduce((s, r) => s + r.pendingCommission, 0))}</td>
                    <td className="py-3 px-3 text-red-600">{formatCurrency(results.reduce((s, r) => s + r.clawbackAmount, 0))}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Commission breakdown cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.slice(0, 6).map(r => (
            <Card key={r.employeeId}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{r.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{r.region} · {r.salesLevel}</p>
                  </div>
                  <Badge variant={r.eligible ? 'success' : 'destructive'}>
                    {formatPercent(r.achievementPercent)}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target</span>
                    <span>{formatCurrency(r.cumTarget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Achievement</span>
                    <span>{formatCurrency(r.cumAchievement)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Milestone 1 (25%)</span>
                    <span className={r.milestone1 > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                      {formatCurrency(r.milestone1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Milestone 2 (75%)</span>
                    <span className={r.milestone2 > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                      {formatCurrency(r.milestone2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 font-semibold">
                    <span>Total Commission</span>
                    <span>{formatCurrency(r.finalCommission)}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cliff: {formatPercent(r.cliff)}</span>
                    <span>{formatPercent(Math.min(r.achievementPercent, 100))} achieved</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${r.eligible ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(r.achievementPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
