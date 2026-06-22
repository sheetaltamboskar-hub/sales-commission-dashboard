import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FY_OPTIONS, QUARTER_OPTIONS, REGION_OPTIONS } from '@/lib/utils'
import type { FilterState, Quarter } from '@/types'
import { useData } from '@/context/DataContext'

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  showEmployee?: boolean
}

export function FilterBar({ filters, onChange, showEmployee = false }: FilterBarProps) {
  const { employees } = useData()

  const set = (key: keyof FilterState, value: string) =>
    onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-wrap gap-3 items-center sticky top-0 z-10 bg-background py-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">Fiscal Year</label>
        <Select value={filters.fy} onValueChange={v => set('fy', v)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FY_OPTIONS.map(fy => <SelectItem key={fy} value={fy}>{fy}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">Quarter</label>
        <Select value={filters.quarter} onValueChange={v => set('quarter', v as Quarter)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUARTER_OPTIONS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">Region</label>
        <Select value={filters.region} onValueChange={v => set('region', v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {REGION_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {showEmployee && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Employee</label>
          <Select value={filters.employeeId} onValueChange={v => set('employeeId', v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map(e => (
                <SelectItem key={e.employeeId} value={e.employeeId}>{e.employeeName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
