import { useState, useMemo } from 'react'
import { Target, TrendingUp, DollarSign, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { calcEmployeeCommission } from '@/services/commissionEngine'
import { formatCurrency, formatPercent, FY_OPTIONS, QUARTER_OPTIONS } from '@/lib/utils'
import type { Quarter } from '@/types'

export function EmployeeDashboard() {
  const { user } = useAuth()
  const { employees, quotas, achievements, deals, milestones, commissionRates,
    regionPolicies, cliffPolicies, kickerPolicies, dualCredits, clawbacks } = useData()

  const [fy, setFy] = useState('FY26')
  const [quarter, setQuarter] = useState<Quarter>('Q3')

  // Default to logged-in user's employee; fall back to first employee
  const [selectedEmpId, setSelectedEmpId] = useState(user?.employeeId ?? '')

  const employee = useMemo(
    () => employees.find(e => e.employeeId === selectedEmpId) ?? employees[0],
    [employees, selectedEmpId]
  )

  const result = useMemo(() => {
    if (!employee) return null
    return calcEmployeeCommission(
      employee, fy, quarter, quotas, achievements, deals,
      commissionRates, regionPolicies, cliffPolicies, kickerPolicies,
      milestones, dualCredits, clawbacks,
    )
  }, [employee, fy, quarter, quotas, achievements, deals, commissionRates,
    regionPolicies, cliffPolicies, kickerPolicies, milestones, dualCredits, clawbacks])

  if (!employee || !result) {
    return <div className="text-muted-foreground p-8 text-center">No employee data available.</div>
  }

  const quota = quotas.find(q => q.fy === fy && q.employeeId === employee.employeeId)
  const empAchievements = achievements.filter(a => a.fy === fy && a.employeeId === employee.employeeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employee Dashboard</h1>
          <p className="text-muted-foreground text-sm">Individual commission summary</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select employee" /></SelectTrigger>
            <SelectContent>
              {employees.map(e => <SelectItem key={e.employeeId} value={e.employeeId}>{e.employeeName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fy} onValueChange={setFy}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{FY_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={quarter} onValueChange={v => setQuarter(v as Quarter)}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{QUARTER_OPTIONS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {employee.employeeName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{employee.employeeName}</h2>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge variant="outline">{employee.region}</Badge>
                <Badge variant="outline">{employee.salesLevel}</Badge>
                <Badge variant={employee.active ? 'success' : 'destructive'}>
                  {employee.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Manager: {employee.manager} · Joined: {employee.doj}</p>
            </div>
            <div className="ml-auto text-right">
              <div className={`text-3xl font-bold ${result.eligible ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(result.achievementPercent)}
              </div>
              <p className="text-sm text-muted-foreground">Achievement</p>
              <p className="text-xs text-muted-foreground mt-1">Cliff: {formatPercent(result.cliff)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-yellow-600 font-medium">Cliff {formatPercent(result.cliff)}</span>
              <span>100%+</span>
            </div>
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              {/* Cliff marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                style={{ left: `${Math.min(result.cliff, 100)}%` }}
              />
              {/* Progress */}
              <div
                className={`h-full rounded-full transition-all ${result.eligible ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(result.achievementPercent, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard title="Cumulative Target" value={formatCurrency(result.cumTarget)} icon={Target} color="blue" />
        <KpiCard title="Cumulative Achievement" value={formatCurrency(result.cumAchievement)} icon={TrendingUp} color="green" />
        <KpiCard title="Total Commission" value={formatCurrency(result.finalCommission)} icon={DollarSign} color="purple" />
        <KpiCard title="Paid Commission" value={formatCurrency(result.paidCommission)} icon={CheckCircle} color="green" />
        <KpiCard title="Pending Commission" value={formatCurrency(result.pendingCommission)} icon={Clock} color="yellow" />
        <KpiCard title="Clawback" value={formatCurrency(result.clawbackAmount)} icon={AlertTriangle} color="red" />
      </div>

      {/* Quarterly breakdown */}
      <Card>
        <CardHeader><CardTitle className="text-base">Quarterly Achievement — {fy}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {QUARTER_OPTIONS.map((q, i) => {
              const ach = empAchievements.find(a => a.quarter === q)?.achievement ?? 0
              const targets = [quota?.q1Target, quota?.q2Target, quota?.q3Target, quota?.q4Target]
              const target = targets[i] ?? 0
              const pct = target > 0 ? (ach / target) * 100 : 0
              return (
                <div key={q} className={`p-4 rounded-lg border ${q === quarter ? 'border-primary bg-primary/5' : ''}`}>
                  <p className="text-sm font-semibold">{q}</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(ach)}</p>
                  <p className="text-xs text-muted-foreground">Target: {formatCurrency(target)}</p>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className="text-xs mt-1 font-medium">{formatPercent(pct)}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Milestone status */}
      <Card>
        <CardHeader><CardTitle className="text-base">Milestone Payouts</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className={`p-5 rounded-lg border-2 ${result.milestone1 > 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-muted'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className={`h-5 w-5 ${result.milestone1 > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span className="font-semibold">Milestone 1 — Setup Fee Paid</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(result.milestone1)}</p>
              <p className="text-sm text-muted-foreground mt-1">25% of final commission</p>
            </div>
            <div className={`p-5 rounded-lg border-2 ${result.milestone2 > 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-muted'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className={`h-5 w-5 ${result.milestone2 > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span className="font-semibold">Milestone 2 — First Billing + Go Live</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(result.milestone2)}</p>
              <p className="text-sm text-muted-foreground mt-1">75% of final commission</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
