import { useState, useMemo } from 'react'
import { Trophy, Medal, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '@/context/DataContext'
import { calcEmployeeCommission, buildLeaderboard } from '@/services/commissionEngine'
import { exportLeaderboardPDF } from '@/services/exportService'
import { formatCurrency, formatPercent, FY_OPTIONS, QUARTER_OPTIONS } from '@/lib/utils'
import type { Quarter } from '@/types'

type SortBy = 'achievementPercent' | 'commission' | 'gmrr'

export function Leaderboard() {
  const [fy, setFy] = useState('FY26')
  const [quarter, setQuarter] = useState<Quarter>('Q3')
  const [sortBy, setSortBy] = useState<SortBy>('achievementPercent')
  const [region, setRegion] = useState('all')

  const { employees, quotas, achievements, deals, milestones, commissionRates,
    regionPolicies, cliffPolicies, kickerPolicies, dualCredits, clawbacks } = useData()

  const entries = useMemo(() => {
    const filtered = region === 'all' ? employees : employees.filter(e => e.region === region)
    const results = filtered.map(emp =>
      calcEmployeeCommission(
        emp, fy, quarter, quotas, achievements, deals,
        commissionRates, regionPolicies, cliffPolicies, kickerPolicies,
        milestones, dualCredits, clawbacks,
      )
    )
    const lb = buildLeaderboard(results)
    return lb.sort((a, b) => b[sortBy] - a[sortBy]).map((e, i) => ({ ...e, rank: i + 1 }))
  }, [employees, fy, quarter, sortBy, region, quotas, achievements, deals,
    commissionRates, regionPolicies, cliffPolicies, kickerPolicies, milestones, dualCredits, clawbacks])

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>
  }

  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">Ranked sales performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportLeaderboardPDF(entries)}>
          <Download className="h-4 w-4 mr-1" /> Export PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={fy} onValueChange={setFy}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>{FY_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={quarter} onValueChange={v => setQuarter(v as Quarter)}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>{QUARTER_OPTIONS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {['India', 'SEA', 'ANZ', 'US', 'LATAM'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="achievementPercent">Sort by Achievement %</SelectItem>
            <SelectItem value="commission">Sort by Commission</SelectItem>
            <SelectItem value="gmrr">Sort by GMRR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Podium */}
      {podium.length >= 1 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd */}
          {podium[1] && (
            <Card className="flex flex-col items-center p-5 text-center order-1">
              <Medal className="h-8 w-8 text-gray-400 mb-2" />
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold mb-2">
                {podium[1].employeeName.charAt(0)}
              </div>
              <p className="font-semibold">{podium[1].employeeName}</p>
              <p className="text-xs text-muted-foreground">{podium[1].region}</p>
              <p className="text-lg font-bold text-primary mt-2">{formatPercent(podium[1].achievementPercent)}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(podium[1].commission)}</p>
              <div className="mt-3 h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
            </Card>
          )}
          {/* 1st */}
          {podium[0] && (
            <Card className="flex flex-col items-center p-5 text-center order-2 ring-2 ring-yellow-400">
              <Trophy className="h-10 w-10 text-yellow-500 mb-2" />
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-2xl font-bold mb-2">
                {podium[0].employeeName.charAt(0)}
              </div>
              <p className="font-bold text-lg">{podium[0].employeeName}</p>
              <p className="text-xs text-muted-foreground">{podium[0].region}</p>
              <p className="text-xl font-bold text-yellow-600 mt-2">{formatPercent(podium[0].achievementPercent)}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(podium[0].commission)}</p>
              <div className="mt-3 h-24 w-full bg-yellow-200 dark:bg-yellow-700 rounded-t-lg" />
            </Card>
          )}
          {/* 3rd */}
          {podium[2] && (
            <Card className="flex flex-col items-center p-5 text-center order-3">
              <Medal className="h-8 w-8 text-amber-600 mb-2" />
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-xl font-bold mb-2">
                {podium[2].employeeName.charAt(0)}
              </div>
              <p className="font-semibold">{podium[2].employeeName}</p>
              <p className="text-xs text-muted-foreground">{podium[2].region}</p>
              <p className="text-lg font-bold text-amber-600 mt-2">{formatPercent(podium[2].achievementPercent)}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(podium[2].commission)}</p>
              <div className="mt-3 h-10 w-full bg-amber-200 dark:bg-amber-700 rounded-t-lg" />
            </Card>
          )}
        </div>
      )}

      {/* Full table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full Rankings — {fy} {quarter}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {['Rank', 'Employee', 'Region', 'Level', 'Achievement %', 'Commission', 'GMRR'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.employeeId} className={`border-b hover:bg-muted/20 ${e.rank <= 3 ? 'font-medium' : ''}`}>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center w-8">{rankIcon(e.rank)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {e.employeeName.charAt(0)}
                        </div>
                        {e.employeeName}
                      </div>
                    </td>
                    <td className="py-3 px-3">{e.region}</td>
                    <td className="py-3 px-3">{e.salesLevel}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-primary">{formatPercent(e.achievementPercent)}</span>
                    </td>
                    <td className="py-3 px-3">{formatCurrency(e.commission)}</td>
                    <td className="py-3 px-3 text-muted-foreground">—</td>
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
