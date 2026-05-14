import type {
  BOMLine, PriceItem, WeightExpense, ProfitabilityRow,
  ComputedProduct, BOMNode, ItemType,
} from '@/types'

// ─── BOM Index ────────────────────────────────────────────────────────────────

function buildBOMIndex(lines: BOMLine[]): Map<string, BOMLine[]> {
  const index = new Map<string, BOMLine[]>()
  for (const line of lines) {
    const key = line.internalReference
    if (!index.has(key)) index.set(key, [])
    index.get(key)!.push(line)
  }
  return index
}

function buildPriceIndex(prices: PriceItem[]): Map<string, PriceItem> {
  const index = new Map<string, PriceItem>()
  for (const p of prices) index.set(p.itemCode, p)
  return index
}

// ─── Weight Expense Lookup ────────────────────────────────────────────────────

export function getWeightExpense(weight: number, expenses: WeightExpense[]): number {
  for (const row of expenses) {
    if (weight >= row.fromWeight && weight <= row.toWeight) {
      return row.expenseUSD
    }
  }
  return 0
}

// ─── Recursive BOM Explosion ──────────────────────────────────────────────────

interface CostAccumulator {
  rawMaterial: number
  packaging: number
  semiFinished: number
  intermediate: number
}

function recursiveCost(
  itemCode: string,
  itemType: ItemType,
  quantity: number,
  bomIndex: Map<string, BOMLine[]>,
  priceIndex: Map<string, PriceItem>,
  visited: Set<string>,
  level: number,
): { node: BOMNode; acc: CostAccumulator } {
  const priceItem = priceIndex.get(itemCode)
  const name = priceItem?.itemName ?? itemCode

  // Circular reference guard
  if (visited.has(itemCode)) {
    console.warn(`[CostingEngine] Circular reference detected: ${itemCode}`)
    return {
      node: { code: itemCode, name, type: itemType, quantity, unitCost: 0, totalCost: 0, children: [], level },
      acc: { rawMaterial: 0, packaging: 0, semiFinished: 0, intermediate: 0 },
    }
  }

  // Leaf nodes — RM or PK (or items not in BOM)
  const children = bomIndex.get(itemCode) ?? []
  if (children.length === 0 || itemType === 'RM' || itemType === 'PK') {
    const unitCost = priceItem?.unitCostUSD ?? 0
    const totalCost = unitCost * quantity
    const acc: CostAccumulator = { rawMaterial: 0, packaging: 0, semiFinished: 0, intermediate: 0 }
    if (itemType === 'RM') acc.rawMaterial = totalCost
    if (itemType === 'PK') acc.packaging = totalCost
    return {
      node: { code: itemCode, name, type: itemType, quantity, unitCost, totalCost, children: [], level },
      acc,
    }
  }

  // Composite node — recurse into children
  const newVisited = new Set(visited).add(itemCode)
  const childNodes: BOMNode[] = []
  const combinedAcc: CostAccumulator = { rawMaterial: 0, packaging: 0, semiFinished: 0, intermediate: 0 }
  let compositeUnitCost = 0

  for (const line of children) {
    const { node: childNode, acc: childAcc } = recursiveCost(
      line.bomLine,
      line.typeBOMLine,
      line.quantity,
      bomIndex,
      priceIndex,
      newVisited,
      level + 1,
    )
    childNodes.push(childNode)
    combinedAcc.rawMaterial  += childAcc.rawMaterial
    combinedAcc.packaging    += childAcc.packaging
    combinedAcc.semiFinished += childAcc.semiFinished
    combinedAcc.intermediate += childAcc.intermediate
    compositeUnitCost        += childNode.totalCost
  }

  const unitCost  = compositeUnitCost / Math.max(quantity, 1)
  const totalCost = compositeUnitCost * (quantity === 0 ? 1 : quantity / quantity) // already scaled in children

  // But actually when this node is referenced FROM a parent, we need totalCost = unitCost * quantity (parent qty)
  // unitCost here = sum of children total costs (already incorporates their qty from BOM def)
  // So totalCost for THIS node at THIS quantity = compositeUnitCost * quantity
  const scaledTotal = compositeUnitCost * quantity

  // Scale acc by quantity (children were computed for BOM qty=1 of THIS item, multiply by how many of THIS item)
  const scaledAcc: CostAccumulator = {
    rawMaterial:  combinedAcc.rawMaterial  * quantity,
    packaging:    combinedAcc.packaging    * quantity,
    semiFinished: combinedAcc.semiFinished * quantity,
    intermediate: combinedAcc.intermediate * quantity,
  }

  // If this node itself is SFG or INT, add its own contribution at the parent level
  if (itemType === 'SFG') scaledAcc.semiFinished += scaledTotal
  if (itemType === 'INT') scaledAcc.intermediate += scaledTotal

  return {
    node: {
      code: itemCode,
      name,
      type: itemType,
      quantity,
      unitCost: compositeUnitCost,
      totalCost: scaledTotal,
      children: childNodes,
      level,
    },
    acc: scaledAcc,
  }
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

export function computeAllProducts(
  profitRows: ProfitabilityRow[],
  bomLines: BOMLine[],
  prices: PriceItem[],
  weightExpenses: WeightExpense[],
): ComputedProduct[] {
  const bomIndex   = buildBOMIndex(bomLines)
  const priceIndex = buildPriceIndex(prices)

  return profitRows.map(row => {
    const { node: bomTree, acc } = recursiveCost(
      row.finalProductCode,
      'FG',
      1,
      bomIndex,
      priceIndex,
      new Set(),
      0,
    )

    const weightExpense       = getWeightExpense(row.netWeight, weightExpenses)
    const rawMaterialCost     = acc.rawMaterial
    const packagingCost       = acc.packaging
    const semiFinishedCost    = acc.semiFinished
    const intermediateCost    = acc.intermediate
    const totalCost           = rawMaterialCost + packagingCost + semiFinishedCost + intermediateCost + weightExpense
    const netSalePrice        = row.companyPrice * (1 - row.discountPct / 100)
    const profitBeforeIns     = netSalePrice - totalCost
    const insurance           = totalCost * 0.10
    const profitAfterIns      = profitBeforeIns - insurance
    const profitabilityPct    = netSalePrice > 0 ? (profitAfterIns / netSalePrice) * 100 : 0

    return {
      ...row,
      netSalePrice,
      rawMaterialCost,
      packagingCost,
      semiFinishedCost,
      intermediateCost,
      weightExpense,
      totalCost,
      profitBeforeInsurance:  profitBeforeIns,
      insurance,
      profitAfterInsurance:   profitAfterIns,
      profitabilityPct,
      bomTree,
    }
  })
}

// ─── KPI Aggregation ─────────────────────────────────────────────────────────

export function aggregateKPIs(products: ComputedProduct[]) {
  return products.reduce(
    (acc, p) => ({
      totalRevenue:      acc.totalRevenue      + p.netSalePrice,
      totalCost:         acc.totalCost         + p.totalCost,
      grossProfit:       acc.grossProfit       + p.profitBeforeInsurance,
      netProfit:         acc.netProfit         + p.profitAfterInsurance,
      profitabilityPct:  0,
      productCount:      acc.productCount      + 1,
    }),
    { totalRevenue: 0, totalCost: 0, grossProfit: 0, netProfit: 0, profitabilityPct: 0, productCount: 0 },
  )
}

export function aggregateByCategory(products: ComputedProduct[]) {
  const map = new Map<string, { revenue: number; cost: number; profit: number; count: number }>()
  for (const p of products) {
    const cat = p.productCategory || 'Uncategorized'
    const cur = map.get(cat) ?? { revenue: 0, cost: 0, profit: 0, count: 0 }
    map.set(cat, {
      revenue: cur.revenue + p.netSalePrice,
      cost:    cur.cost    + p.totalCost,
      profit:  cur.profit  + p.profitAfterInsurance,
      count:   cur.count   + 1,
    })
  }
  return Array.from(map.entries()).map(([category, v]) => ({
    category,
    ...v,
    profitabilityPct: v.revenue > 0 ? (v.profit / v.revenue) * 100 : 0,
  }))
}
