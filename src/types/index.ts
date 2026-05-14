// ─── Data Models ─────────────────────────────────────────────────────────────

export type ItemType = 'FG' | 'SFG' | 'INT' | 'RM' | 'PK'

export interface ProfitabilityRow {
  productCategory: string
  finalProductCode: string
  productName: string
  unit: string
  netWeight: number
  companyPrice: number
  discountPct: number
  // Computed fields
  netSalePrice?: number
  rawMaterialCost?: number
  packagingCost?: number
  semiFinishedCost?: number
  intermediateCost?: number
  weightExpense?: number
  totalCost?: number
  profitBeforeInsurance?: number
  insurance?: number
  profitAfterInsurance?: number
  profitabilityPct?: number
}

export interface BOMLine {
  internalReference: string
  typeInternalReference: ItemType
  bomLine: string
  bomLineName: string
  typeBOMLine: ItemType
  quantity: number
}

export interface PriceItem {
  itemCode: string
  itemName: string
  itemType: ItemType
  unitCostUSD: number
}

export interface WeightExpense {
  fromWeight: number
  toWeight: number
  expenseUSD: number
}

// ─── Costing Engine Types ─────────────────────────────────────────────────────

export interface CostBreakdown {
  itemCode: string
  itemName: string
  itemType: ItemType
  rawMaterialCost: number
  packagingCost: number
  semiFinishedCost: number
  intermediateCost: number
  totalMaterialCost: number
}

export interface BOMNode {
  code: string
  name: string
  type: ItemType
  quantity: number
  unitCost: number
  totalCost: number
  children: BOMNode[]
  level: number
}

export interface ComputedProduct extends ProfitabilityRow {
  netSalePrice: number
  rawMaterialCost: number
  packagingCost: number
  semiFinishedCost: number
  intermediateCost: number
  weightExpense: number
  totalCost: number
  profitBeforeInsurance: number
  insurance: number
  profitAfterInsurance: number
  profitabilityPct: number
  bomTree?: BOMNode
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface UploadedFiles {
  profitability: ProfitabilityRow[] | null
  bom: BOMLine[] | null
  prices: PriceItem[] | null
  weightExpenses: WeightExpense[] | null
}

export interface AppSettings {
  usdToLydRate: number
  currency: 'USD' | 'LYD'
  theme: 'light' | 'dark'
}

export interface AppState {
  files: UploadedFiles
  settings: AppSettings
  computedProducts: ComputedProduct[]
  isComputing: boolean
  error: string | null
  setFile: <K extends keyof UploadedFiles>(key: K, data: UploadedFiles[K]) => void
  setSettings: (settings: Partial<AppSettings>) => void
  compute: () => void
  reset: () => void
}

// ─── Chart / Dashboard Types ──────────────────────────────────────────────────

export interface KPISummary {
  totalRevenue: number
  totalCost: number
  grossProfit: number
  netProfit: number
  avgProfitabilityPct: number
  productCount: number
}

export interface CategorySummary {
  category: string
  revenue: number
  cost: number
  profit: number
  profitabilityPct: number
  count: number
}
