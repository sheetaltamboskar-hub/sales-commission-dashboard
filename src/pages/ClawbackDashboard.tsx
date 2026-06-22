import { useMemo } from 'react'
import { AlertTriangle, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/context/DataContext'
import { formatCurrency } from '@/lib/utils'

export function ClawbackDashboard() {
  const { clawbacks, deals, employees } = useData()

  const enriched = useMemo(() =>
    clawbacks.map(c => {
      const deal = deals.find(d => d.dealId === c.dealId)
      const emp = employees.find(e => e.employeeId === c.employee)
      return { ...c, customer: deal?.customer ?? c.dealId, employeeName: emp?.employeeName ?? c.employee }
    })
  , [clawbacks, deals, employees])

  const totalPaid = enriched.reduce((s, c) => s + c.paidAmount, 0)
  const totalClawback = enriched.reduce((s, c) => s + c.clawbackAmount, 0)
  const recovered = enriched.filter(c => c.status === 'Recovered').reduce((s, c) => s + c.clawbackAmount, 0)
  const pending = enriched.filter(c => c.status === 'Pending').reduce((s, c) => s + c.clawbackAmount, 0)

  const statusBadge = (status: string) => {
    const map: Record<string, 'success' | 'destructive' | 'warning'> = {
      Recovered: 'success', Pending: 'destructive', Waived: 'warning',
    }
    return <Badge variant={map[status] ?? 'outline'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clawback Dashboard</h1>
        <p className="text-muted-foreground text-sm">Track churned deals and commission recovery</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Churned Deals" value={enriched.length.toString()} icon={AlertTriangle} color="red" />
        <KpiCard title="Total Paid Out" value={formatCurrency(totalPaid)} icon={DollarSign} color="blue" />
        <KpiCard title="Clawback Amount" value={formatCurrency(totalClawback)} icon={XCircle} color="red" />
        <KpiCard title="Recovered" value={formatCurrency(recovered)} icon={CheckCircle} color="green" />
      </div>

      {/* Recovery progress */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recovery Status</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Recovered', amount: recovered, color: 'bg-green-500' },
              { label: 'Pending Recovery', amount: pending, color: 'bg-red-500' },
              { label: 'Waived', amount: totalClawback - recovered - pending, color: 'bg-yellow-500' },
            ].map(({ label, amount, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${totalClawback > 0 ? (amount / totalClawback) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Clawback Details</CardTitle></CardHeader>
        <CardContent>
          {enriched.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>No clawbacks on record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {['Deal ID', 'Customer', 'Employee', 'Paid Amount', 'Clawback Amount', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enriched.map((c, i) => (
                    <tr key={i} className="border-b hover:bg-muted/20">
                      <td className="py-3 px-3 font-mono text-xs">{c.dealId}</td>
                      <td className="py-3 px-3 font-medium">{c.customer}</td>
                      <td className="py-3 px-3">{c.employeeName}</td>
                      <td className="py-3 px-3 text-green-600">{formatCurrency(c.paidAmount)}</td>
                      <td className="py-3 px-3 text-red-600 font-semibold">-{formatCurrency(c.clawbackAmount)}</td>
                      <td className="py-3 px-3">{statusBadge(c.status)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td colSpan={3} className="py-3 px-3">Total</td>
                    <td className="py-3 px-3 text-green-600">{formatCurrency(totalPaid)}</td>
                    <td className="py-3 px-3 text-red-600">-{formatCurrency(totalClawback)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
