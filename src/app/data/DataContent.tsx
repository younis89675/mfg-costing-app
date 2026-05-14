'use client'
import { useCallback, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridReadyEvent, ValueFormatterParams } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { useAppStore } from '@/lib/store/appStore'
import { formatCurrency, formatPct } from '@/lib/utils/format'
import { Download, Filter, Columns3 } from 'lucide-react'
import type { ComputedProduct } from '@/types'

export function DataContent() {
  const gridRef = useRef<AgGridReact>(null)
  const { computedProducts, settings } = useAppStore()
  const [quickFilter, setQuickFilter] = useState('')

  const fmt = useCallback((v: number) => formatCurrency(v, settings.currency, settings.usdToLydRate), [settings])

  const colDefs = useMemo<ColDef<ComputedProduct>[]>(() => [
    { field: 'productCategory', headerName: 'Category',        width: 110, rowGroup: false, filter: 'agTextColumnFilter', pinned: 'left' },
    { field: 'finalProductCode',headerName: 'Code',            width: 100, filter: 'agTextColumnFilter', pinned: 'left' },
    { field: 'productName',     headerName: 'Product',         flex: 1, minWidth: 160, filter: 'agTextColumnFilter' },
    { field: 'unit',            headerName: 'Unit',            width: 65 },
    { field: 'netWeight',       headerName: 'Net Wt.',         width: 85, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => `${p.value?.toFixed(3)} kg` },
    { field: 'companyPrice',    headerName: 'List Price',      width: 110, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'discountPct',     headerName: 'Disc %',          width: 75,  type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => formatPct(p.value) },
    { field: 'netSalePrice',    headerName: 'Net Sale',        width: 110, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'rawMaterialCost', headerName: 'Raw Mat.',        width: 100, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'packagingCost',   headerName: 'Packaging',       width: 100, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'semiFinishedCost',headerName: 'Semi-Fin.',       width: 100, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'intermediateCost',headerName: 'Intermediate',    width: 105, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'weightExpense',   headerName: 'Wt. Exp.',        width: 90,  type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'totalCost',       headerName: 'Total Cost',      width: 110, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'profitBeforeInsurance', headerName: 'Profit B/Ins', width: 110, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'insurance',       headerName: 'Insurance',       width: 100, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value) },
    { field: 'profitAfterInsurance', headerName: 'Net Profit',  width: 110, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => fmt(p.value),
      cellStyle: (p) => ({ color: (p.value ?? 0) >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }) },
    { field: 'profitabilityPct', headerName: 'Margin %',       width: 95, type: 'numericColumn', valueFormatter: (p: ValueFormatterParams) => formatPct(p.value ?? 0),
      cellStyle: (p) => ({ color: (p.value ?? 0) >= 10 ? '#10b981' : (p.value ?? 0) >= 0 ? '#f59e0b' : '#ef4444', fontWeight: 700 }) },
  ], [fmt])

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
  }), [])

  const exportCSV = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({ fileName: 'profitability-analysis.csv' })
  }, [])

  if (!computedProducts.length) return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">
      No data available. Upload files first.
    </div>
  )

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          value={quickFilter}
          onChange={e => setQuickFilter(e.target.value)}
          placeholder="Quick filter all columns…"
          className="input max-w-xs text-xs py-2"
        />
        <button onClick={exportCSV} className="btn-secondary text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
        <span className="text-xs text-slate-400 ml-auto">{computedProducts.length} records · Click column headers to sort/filter</span>
      </div>

      {/* Grid */}
      <div className="ag-theme-alpine dark:ag-theme-alpine-dark flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" style={{ height: 'calc(100% - 50px)' }}>
        <AgGridReact
          ref={gridRef}
          rowData={computedProducts}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilter}
          animateRows
          rowSelection="multiple"
          enableCellTextSelection
          suppressMenuHide={false}
          pagination
          paginationPageSize={25}
        />
      </div>
    </div>
  )
}
