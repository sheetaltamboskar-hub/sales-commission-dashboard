import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { Upload, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

type SheetType = 'employees' | 'targets' | 'achievements' | 'deals'

interface ImportResult {
  sheet: SheetType
  rows: number
  status: 'success' | 'error'
  message: string
}

const SHEET_LABELS: Record<SheetType, string> = {
  employees: 'Employee Master',
  targets: 'Quota Master',
  achievements: 'Achievement Master',
  deals: 'Deal Master',
}

const EXPECTED_HEADERS: Record<SheetType, string[]> = {
  employees: ['Employee ID', 'Employee Name', 'Region', 'Sales Level', 'DOJ', 'Manager', 'Active'],
  targets: ['FY', 'Employee ID', 'Q1 Target', 'Q2 Target', 'Q3 Target', 'Q4 Target'],
  achievements: ['FY', 'Employee ID', 'Quarter', 'Achievement'],
  deals: ['Deal ID', 'SAP ID', 'Customer', 'Region', 'Currency', 'MRR', 'Setup Fee', 'POC', 'Contract Months', 'Contract Years', 'Annual Advance', 'Booking Month', 'Live Date', 'Status'],
}

export function FileImport() {
  const [activeSheet, setActiveSheet] = useState<SheetType>('employees')
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [results, setResults] = useState<ImportResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
        const headers = raw[0] as string[]
        const rows = raw.slice(1) as string[][]

        setPreview({ headers, rows: rows.slice(0, 5) })

        toast({
          title: 'File loaded',
          description: `${rows.length} data rows detected`,
          variant: 'success',
        })
      } catch {
        toast({
          title: 'Error reading file',
          description: 'Please upload a valid XLSX or CSV file',
          variant: 'destructive',
        })
      }
    }
    reader.readAsArrayBuffer(file)
  }, [toast])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  })

  const handleImport = async () => {
    if (!preview) return
    setIsProcessing(true)

    // Simulate validation / import
    await new Promise(r => setTimeout(r, 1200))

    const expected = EXPECTED_HEADERS[activeSheet]
    const headersMatch = expected.every(h =>
      preview.headers.some(ph => ph.toLowerCase().includes(h.toLowerCase()))
    )

    const result: ImportResult = headersMatch
      ? { sheet: activeSheet, rows: preview.rows.length, status: 'success', message: `${preview.rows.length} rows validated successfully` }
      : { sheet: activeSheet, rows: 0, status: 'error', message: 'Header mismatch. Please check the template.' }

    setResults(prev => [result, ...prev])
    setIsProcessing(false)

    toast({
      title: headersMatch ? 'Import successful' : 'Import failed',
      description: result.message,
      variant: headersMatch ? 'success' : 'destructive',
    })

    if (headersMatch) {
      setPreview(null)
    }
  }

  const downloadTemplate = (sheet: SheetType) => {
    const headers = EXPECTED_HEADERS[sheet]
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers])
    XLSX.utils.book_append_sheet(wb, ws, SHEET_LABELS[sheet])
    XLSX.writeFile(wb, `template_${sheet}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">File Import</h1>
        <p className="text-muted-foreground text-sm">Upload XLSX or CSV files to update master data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(SHEET_LABELS) as SheetType[]).map(sheet => (
          <button
            key={sheet}
            onClick={() => { setActiveSheet(sheet); setPreview(null) }}
            className={cn(
              'p-4 rounded-lg border text-left transition-colors',
              activeSheet === sheet ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            )}
          >
            <FileText className={cn('h-5 w-5 mb-2', activeSheet === sheet ? 'text-primary' : 'text-muted-foreground')} />
            <p className="font-medium text-sm">{SHEET_LABELS[sheet]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{EXPECTED_HEADERS[sheet].length} columns</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload zone */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upload — {SHEET_LABELS[activeSheet]}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate(activeSheet)}>
                Download Template
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-primary font-medium">Drop the file here</p>
              ) : (
                <>
                  <p className="font-medium">Drag & drop or click to upload</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports .xlsx and .csv</p>
                </>
              )}
              {acceptedFiles[0] && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {acceptedFiles[0].name}
                </div>
              )}
            </div>

            {preview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Preview ({preview.rows.length} rows shown)</p>
                  <button onClick={() => setPreview(null)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="overflow-x-auto border rounded-md">
                  <table className="text-xs w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        {preview.headers.slice(0, 6).map((h, i) => (
                          <th key={i} className="py-2 px-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t">
                          {row.slice(0, 6).map((cell, j) => (
                            <td key={j} className="py-2 px-3">{String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button onClick={handleImport} disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Validating…' : `Import ${SHEET_LABELS[activeSheet]}`}
                </Button>
              </div>
            )}

            {/* Required columns */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Required columns:</p>
              <div className="flex flex-wrap gap-1">
                {EXPECTED_HEADERS[activeSheet].map(h => (
                  <span key={h} className="text-xs bg-muted px-2 py-0.5 rounded">{h}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import History</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="h-10 w-10 mx-auto mb-2" />
                <p>No imports yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div key={i} className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    r.status === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20' : 'bg-red-50 border-red-200 dark:bg-red-900/20'
                  )}>
                    {r.status === 'success'
                      ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      : <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{SHEET_LABELS[r.sheet]}</span>
                        <Badge variant={r.status === 'success' ? 'success' : 'destructive'}>
                          {r.status === 'success' ? `${r.rows} rows` : 'Failed'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
