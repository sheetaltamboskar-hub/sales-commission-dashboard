import { useState, useMemo } from 'react'
import { Download, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/context/DataContext'
import { calcDealCommission, calcGMRR } from '@/services/commissionEngine'
import { exportDealCommissionsExcel } from '@/services/exportService'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function DealTracker() {
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [fy, setFy] = useState('FY26')

  const { deals, employees, milestones, commissionRates, regionPolicies, kickerPolicies, dualCredits } = useData()

  const dealCommissions = useMemo(() => {
    const results = []
    for (const deal of deals) {
      const dual = dualCredits.find(d => d.dealId === deal.dealId)
      const empId = dual?.employee1 ?? null
      const emp = employees.find(e => e.employeeId === empId) ?? employees[0]
      if (!emp) continue
      results.push(calcDealCommission(deal, emp, commissionRates, regionPolicies, kickerPolicies, milestones, fy))
    }
    return results
  }, [deals, employees, milestones, commissionRates, regionPolicies, kickerPolicies, dualCredits, fy])

  const filtered = useMemo(() => {
    return dealCommissions.filter(d => {
      const matchesSearch = !search || d.customer.toLowerCase().includes(search.toLowerCase()) ||
        d.dealId.toLowerCase().includes(search.toLowerCase())
      const matchesRegion = regionFilter === 'all' || d.region === regionFilter
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter
      return matchesSearch && matchesRegion && matchesStatus
    })
  }, [dealCommissions, search, regionFilter, statusFilter])

  const statusBadge = (status: string) => {
    const map: Record<string, 'success' | 'destructive' | 'warning'> = {
      Active: 'success', Churned: 'destructive', Pending: 'warning',
    }
    return <Badge variant={map[status] ?? 'outline'}>{status}</Badge>
  }

  const milestoneBadge = (unlocked: boolean, label: string) => (
    <span className={`text-xs px-1.5 py-0.5 rounded ${unlocked ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
      {label}
    </span>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deal Tracker</h1>
          <p className="text-muted-foreground text-sm">Commission breakdown by deal</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportDealCommissionsExcel(filtered)}>
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customer or deal ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 h-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-56"
          />
        </div>
        <Select value={fy} onValueChange={setFy}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['FY25', 'FY26', 'FY27'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Region" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {['India', 'SEA', 'ANZ', 'US', 'LATAM'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {['Active', 'Churned', 'Pending'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Deals', value: filtered.length.toString() },
          { label: 'Total GMRR', value: formatCurrency(filtered.reduce((s, d) => s + d.gmrr, 0)) },
          { label: 'Total Commission', value: formatCurrency(filtered.reduce((s, d) => s + d.finalCommission, 0)) },
          { label: 'Churned Deals', value: filtered.filter(d => d.status === 'Churned').length.toString() },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deal Commission Details ({filtered.length} deals)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {['Deal ID', 'Customer', 'Region', 'MRR', 'Setup Fee', 'GMRR', 'Contract', 'Kicker', 'Commission', 'Milestones', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.dealId} className="border-b hover:bg-muted/20">
                    <td className="py-3 px-3 font-mono text-xs">{d.dealId}</td>
                    <td className="py-3 px-3 font-medium">{d.customer}</td>
                    <td className="py-3 px-3">{d.region}</td>
                    <td className="py-3 px-3">{formatCurrency(d.mrr)}</td>
                    <td className="py-3 px-3">{formatCurrency(d.setupFee)}</td>
                    <td className="py-3 px-3 font-medium">{formatCurrency(d.gmrr)}</td>
                    <td className="py-3 px-3">
                      {d.contractYears}yr {d.annualAdvance ? '· AA' : ''}
                    </td>
                    <td className="py-3 px-3">
                      {d.kicker > 0 ? (
                        <span className="text-green-600 font-medium">{formatPercent(d.kicker)}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-3 font-semibold">{formatCurrency(d.finalCommission)}</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        {milestoneBadge(d.milestone1Unlocked, 'M1')}
                        {milestoneBadge(d.milestone2Unlocked, 'M2')}
                      </div>
                    </td>
                    <td className="py-3 px-3">{statusBadge(d.status)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={11} className="py-8 text-center text-muted-foreground">No deals found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
