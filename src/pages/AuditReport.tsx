import { useState, useMemo } from 'react'
import { Download, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '@/context/DataContext'
import { calcEmployeeCommission } from '@/services/commissionEngine'
import { exportCommissionResultsExcel, exportCommissionPDF } from '@/services/exportService'
import { formatCurrency, formatPercent, FY_OPTIONS, QUARTER_OPTIONS } from '@/lib/utils'
import type { Quarter } from '@/types'

type View = 'employee' | 'quarter' | 'fy' | 'region'

export function AuditReport() {
  const [fy, setFy] = useState('FY26')
  const [quarter, setQuarter] = useState<Quarter>('Q3')
  const [view, setView] = useState<View>('employee')

  const { employees, quotas, achievements, deals, milestones, commissionRates,
    regionPolicies, cliffPolicies, kickerPolicies, dualCredits, clawbacks } = useData()

  const allResults = useMemo(() =>
    QUARTER_OPTIONS.flatMap(q =>
      employees.map(emp =>
        calcEmployeeCommission(
          emp, fy, q, quotas, achievements, deals,
          commissionRates, regionPolicies, cliffPolicies, kickerPolicies,
          milestones, dualCredits, clawbacks,
        )
      )
    )
  , [employees, fy, quotas, achievements, deals, commissionRates,
    regionPolicies, cliffPolicies, kickerPolicies, milestones, dualCredits, clawbacks])

  const quarterResults = useMemo(() =>
    employees.map(emp =>
      calcEmployeeCommission(
        emp, fy, quarter, quotas, achievements, deals,
        commissionRates, regionPolicies, cliffPolicies, kickerPolicies,
        milestones, dualCredits, clawbacks,
      )
    )
  , [employees, fy, quarter, quotas, achievements, deals, commissionRates,
    regionPolicies, cliffPolicies, kickerPolicies, milestones, dualCredits, clawbacks])

  const byEmployee = useMemo(() => {
    const map = new Map<string, { name: string; region: string; commission: number; achievement: number; target: number }>()
    allResults.forEach(r => {
      const existing = map.get(r.employeeId)
      if (existing) {
        existing.commission += r.finalCommission
        existing.achievement += r.cumAchievement
        existing.target += r.cumTarget
      } else {
        map.set(r.employeeId, {
          name: r.employeeName,
          region: r.region,
          commission: r.finalCommission,
          achievement: r.cumAchievement,
          target: r.cumTarget,
        })
      }
    })
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }))
  }, [allResults])

  const byQuarter = useMemo(() =>
    QUARTER_OPTIONS.map(q => {
      const results = allResults.filter(r => r.quarter === q)
      return {
        quarter: q,
        target: results.reduce((s, r) => s + r.cumTarget, 0),
        achievement: results.reduce((s, r) => s + r.cumAchievement, 0),
        commission: results.reduce((s, r) => s + r.finalCommission, 0),
        paid: results.reduce((s, r) => s + r.paidCommission, 0),
      }
    })
  , [allResults])

  const byRegion = useMemo(() => {
    const map = new Map<string, { commission: number; achievement: number; target: number; count: number }>()
    allResults.forEach(r => {
      const existing = map.get(r.region)
      if (existing) {
        existing.commission += r.finalCommission
        existing.achievement += r.cumAchievement
        existing.target += r.cumTarget
        existing.count++
      } else {
        map.set(r.region, { commission: r.finalCommission, achievement: r.cumAchievement, target: r.cumTarget, count: 1 })
      }
    })
    return Array.from(map.entries()).map(([region, v]) => ({ region, ...v }))
  }, [allResults])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Report</h1>
          <p className="text-muted-foreground text-sm">Complete commission audit trail</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCommissionResultsExcel(quarterResults)}>
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCommissionPDF(quarterResults, `Audit ${fy} ${quarter}`)}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={fy} onValueChange={setFy}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>{FY_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={quarter} onValueChange={v => setQuarter(v as Quarter)}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>{QUARTER_OPTIONS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={view} onValueChange={v => setView(v as View)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">By Employee</SelectItem>
            <SelectItem value="quarter">By Quarter</SelectItem>
            <SelectItem value="region">By Region</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === 'employee' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Employee-wise Commission — {fy}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {['Employee', 'Region', 'Total Target', 'Total Achievement', 'Ach %', 'Total Commission'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byEmployee.map(e => (
                    <tr key={e.id} className="border-b hover:bg-muted/20">
                      <td className="py-3 px-3 font-medium">{e.name}</td>
                      <td className="py-3 px-3">{e.region}</td>
                      <td className="py-3 px-3">{formatCurrency(e.target)}</td>
                      <td className="py-3 px-3">{formatCurrency(e.achievement)}</td>
                      <td className="py-3 px-3">{formatPercent(e.target > 0 ? (e.achievement / e.target) * 100 : 0)}</td>
                      <td className="py-3 px-3 font-semibold">{formatCurrency(e.commission)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td colSpan={2} className="py-3 px-3">Total</td>
                    <td className="py-3 px-3">{formatCurrency(byEmployee.reduce((s, e) => s + e.target, 0))}</td>
                    <td className="py-3 px-3">{formatCurrency(byEmployee.reduce((s, e) => s + e.achievement, 0))}</td>
                    <td />
                    <td className="py-3 px-3">{formatCurrency(byEmployee.reduce((s, e) => s + e.commission, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'quarter' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quarter-wise Commission — {fy}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {['Quarter', 'Target', 'Achievement', 'Ach %', 'Commission', 'Paid'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byQuarter.map(q => (
                    <tr key={q.quarter} className="border-b hover:bg-muted/20">
                      <td className="py-3 px-3 font-semibold">{q.quarter}</td>
                      <td className="py-3 px-3">{formatCurrency(q.target)}</td>
                      <td className="py-3 px-3">{formatCurrency(q.achievement)}</td>
                      <td className="py-3 px-3">{formatPercent(q.target > 0 ? (q.achievement / q.target) * 100 : 0)}</td>
                      <td className="py-3 px-3 font-semibold">{formatCurrency(q.commission)}</td>
                      <td className="py-3 px-3 text-green-600">{formatCurrency(q.paid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'region' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Region-wise Commission — {fy}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {['Region', 'Employees', 'Target', 'Achievement', 'Ach %', 'Commission'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byRegion.map(r => (
                    <tr key={r.region} className="border-b hover:bg-muted/20">
                      <td className="py-3 px-3 font-medium">{r.region}</td>
                      <td className="py-3 px-3">{r.count / QUARTER_OPTIONS.length}</td>
                      <td className="py-3 px-3">{formatCurrency(r.target)}</td>
                      <td className="py-3 px-3">{formatCurrency(r.achievement)}</td>
                      <td className="py-3 px-3">{formatPercent(r.target > 0 ? (r.achievement / r.target) * 100 : 0)}</td>
                      <td className="py-3 px-3 font-semibold">{formatCurrency(r.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
