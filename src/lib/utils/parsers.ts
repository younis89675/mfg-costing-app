import * as XLSX from 'xlsx'
import type { ProfitabilityRow, BOMLine, PriceItem, WeightExpense, ItemType } from '@/types'

function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        resolve(XLSX.read(data, { type: 'array' }))
      } catch (err) { reject(err) }
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsArrayBuffer(file)
  })
}

function sheetToRows(wb: XLSX.WorkBook, sheetIndex = 0): Record<string, unknown>[] {
  const sheet = wb.Sheets[wb.SheetNames[sheetIndex]]
  return XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[]
}

function num(v: unknown): number {
  const n = parseFloat(String(v).replace(/,/g, ''))
  return isNaN(n) ? 0 : n
}
function str(v: unknown): string { return String(v ?? '').trim() }
function itemType(v: unknown): ItemType {
  const s = str(v).toUpperCase()
  if (['FG','SFG','INT','RM','PK'].includes(s)) return s as ItemType
  return 'RM'
}

export async function parseProfitabilityFile(file: File): Promise<ProfitabilityRow[]> {
  const wb = await readWorkbook(file)
  const rows = sheetToRows(wb)
  return rows.map(r => ({
    productCategory:   str(r['Product Category']   ?? r['product_category']   ?? r['Category']),
    finalProductCode:  str(r['Final Product Code']  ?? r['final_product_code'] ?? r['Product Code'] ?? r['Code']),
    productName:       str(r['Product Name']        ?? r['product_name']       ?? r['Name']),
    unit:              str(r['Unit']                ?? r['unit']               ?? 'KG'),
    netWeight:         num(r['Net Weight']          ?? r['net_weight']         ?? r['Weight']),
    companyPrice:      num(r['Company Price']       ?? r['company_price']      ?? r['Price']),
    discountPct:       num(r['Discount %']          ?? r['discount_pct']       ?? r['Discount']),
  })).filter(r => r.finalProductCode && r.companyPrice > 0)
}

export async function parseBOMFile(file: File): Promise<BOMLine[]> {
  const wb = await readWorkbook(file)
  const rows = sheetToRows(wb)
  return rows.map(r => ({
    internalReference:     str(r['Internal Reference']      ?? r['internal_reference'] ?? r['Parent']),
    typeInternalReference: itemType(r['Type Internal Reference'] ?? r['type_internal'] ?? 'FG'),
    bomLine:               str(r['BOM Line']               ?? r['bom_line']          ?? r['Component']),
    bomLineName:           str(r['BOM Line Name']          ?? r['bom_line_name']     ?? r['Component Name']),
    typeBOMLine:           itemType(r['Type BOM Line']     ?? r['type_bom_line']     ?? 'RM'),
    quantity:              num(r['Quantity']               ?? r['quantity']          ?? r['Qty']),
  })).filter(r => r.internalReference && r.bomLine && r.quantity > 0)
}

export async function parsePriceFile(file: File): Promise<PriceItem[]> {
  const wb = await readWorkbook(file)
  const rows = sheetToRows(wb)
  return rows.map(r => ({
    itemCode:    str(r['Item Code']    ?? r['item_code']   ?? r['Code']),
    itemName:    str(r['Item Name']    ?? r['item_name']   ?? r['Name']),
    itemType:    itemType(r['Item Type'] ?? r['item_type'] ?? 'RM'),
    unitCostUSD: num(r['Unit Cost USD'] ?? r['unit_cost'] ?? r['Cost']),
  })).filter(r => r.itemCode && r.unitCostUSD >= 0)
}

export async function parseWeightExpenseFile(file: File): Promise<WeightExpense[]> {
  const wb = await readWorkbook(file)
  const rows = sheetToRows(wb)
  return rows.map(r => ({
    fromWeight: num(r['From Weight'] ?? r['from_weight'] ?? r['From']),
    toWeight:   num(r['To Weight']   ?? r['to_weight']   ?? r['To']),
    expenseUSD: num(r['Expense USD'] ?? r['expense_usd'] ?? r['Expense']),
  })).filter(r => r.toWeight > 0)
}

// ─── Mock Data Generator ──────────────────────────────────────────────────────

export function generateMockProfitability(): ProfitabilityRow[] {
  return [
    { productCategory: 'Dairy',     finalProductCode: 'FG-001', productName: 'Full Cream Milk 1L',      unit: 'L',  netWeight: 1.02, companyPrice: 3.50,  discountPct: 5  },
    { productCategory: 'Dairy',     finalProductCode: 'FG-002', productName: 'Skimmed Milk 1L',         unit: 'L',  netWeight: 1.01, companyPrice: 3.20,  discountPct: 5  },
    { productCategory: 'Dairy',     finalProductCode: 'FG-003', productName: 'Yogurt 500g',             unit: 'KG', netWeight: 0.52, companyPrice: 2.80,  discountPct: 0  },
    { productCategory: 'Dairy',     finalProductCode: 'FG-004', productName: 'Butter 250g',             unit: 'KG', netWeight: 0.26, companyPrice: 4.50,  discountPct: 10 },
    { productCategory: 'Beverages', finalProductCode: 'FG-005', productName: 'Orange Juice 1L',         unit: 'L',  netWeight: 1.05, companyPrice: 4.20,  discountPct: 0  },
    { productCategory: 'Beverages', finalProductCode: 'FG-006', productName: 'Apple Juice 500ml',       unit: 'L',  netWeight: 0.53, companyPrice: 2.50,  discountPct: 8  },
    { productCategory: 'Snacks',    finalProductCode: 'FG-007', productName: 'Cheese Crackers 200g',    unit: 'KG', netWeight: 0.21, companyPrice: 3.80,  discountPct: 0  },
    { productCategory: 'Snacks',    finalProductCode: 'FG-008', productName: 'Potato Chips 150g',       unit: 'KG', netWeight: 0.16, companyPrice: 2.20,  discountPct: 5  },
    { productCategory: 'Bakery',    finalProductCode: 'FG-009', productName: 'Whole Wheat Bread 500g',  unit: 'KG', netWeight: 0.52, companyPrice: 2.90,  discountPct: 0  },
    { productCategory: 'Bakery',    finalProductCode: 'FG-010', productName: 'Croissant 80g',           unit: 'KG', netWeight: 0.09, companyPrice: 1.50,  discountPct: 0  },
    { productCategory: 'Condiments',finalProductCode: 'FG-011', productName: 'Tomato Sauce 500g',       unit: 'KG', netWeight: 0.53, companyPrice: 3.10,  discountPct: 5  },
    { productCategory: 'Condiments',finalProductCode: 'FG-012', productName: 'Mayonnaise 250g',         unit: 'KG', netWeight: 0.26, companyPrice: 2.70,  discountPct: 0  },
  ]
}

export function generateMockBOM(): BOMLine[] {
  return [
    // FG-001 = Full Cream Milk
    { internalReference: 'FG-001', typeInternalReference: 'FG', bomLine: 'SFG-001', bomLineName: 'Processed Milk Base',  typeBOMLine: 'SFG', quantity: 0.95 },
    { internalReference: 'FG-001', typeInternalReference: 'FG', bomLine: 'PK-001',  bomLineName: 'PET Bottle 1L',        typeBOMLine: 'PK',  quantity: 1    },
    { internalReference: 'FG-001', typeInternalReference: 'FG', bomLine: 'PK-002',  bomLineName: 'Label Adhesive',       typeBOMLine: 'PK',  quantity: 1    },
    // SFG-001 = Processed Milk Base
    { internalReference: 'SFG-001', typeInternalReference: 'SFG', bomLine: 'RM-001', bomLineName: 'Raw Whole Milk',      typeBOMLine: 'RM', quantity: 1.05 },
    { internalReference: 'SFG-001', typeInternalReference: 'SFG', bomLine: 'INT-001', bomLineName: 'Stabilizer Mix',     typeBOMLine: 'INT', quantity: 0.002 },
    // INT-001 = Stabilizer Mix
    { internalReference: 'INT-001', typeInternalReference: 'INT', bomLine: 'RM-004', bomLineName: 'Carrageenan',         typeBOMLine: 'RM', quantity: 0.6  },
    { internalReference: 'INT-001', typeInternalReference: 'INT', bomLine: 'RM-005', bomLineName: 'Guar Gum',            typeBOMLine: 'RM', quantity: 0.4  },
    // FG-002 = Skimmed Milk
    { internalReference: 'FG-002', typeInternalReference: 'FG', bomLine: 'SFG-002', bomLineName: 'Skimmed Milk Base',   typeBOMLine: 'SFG', quantity: 0.95 },
    { internalReference: 'FG-002', typeInternalReference: 'FG', bomLine: 'PK-001',  bomLineName: 'PET Bottle 1L',       typeBOMLine: 'PK',  quantity: 1    },
    { internalReference: 'FG-002', typeInternalReference: 'FG', bomLine: 'PK-002',  bomLineName: 'Label Adhesive',      typeBOMLine: 'PK',  quantity: 1    },
    { internalReference: 'SFG-002', typeInternalReference: 'SFG', bomLine: 'RM-001', bomLineName: 'Raw Whole Milk',     typeBOMLine: 'RM', quantity: 1.10 },
    { internalReference: 'SFG-002', typeInternalReference: 'SFG', bomLine: 'RM-006', bomLineName: 'Skim Powder',        typeBOMLine: 'RM', quantity: 0.02 },
    // FG-005 = Orange Juice
    { internalReference: 'FG-005', typeInternalReference: 'FG', bomLine: 'SFG-003', bomLineName: 'OJ Concentrate Mix', typeBOMLine: 'SFG', quantity: 0.90 },
    { internalReference: 'FG-005', typeInternalReference: 'FG', bomLine: 'PK-003',  bomLineName: 'Tetra Pak 1L',       typeBOMLine: 'PK',  quantity: 1    },
    { internalReference: 'SFG-003', typeInternalReference: 'SFG', bomLine: 'RM-007', bomLineName: 'OJ Concentrate',    typeBOMLine: 'RM', quantity: 0.15 },
    { internalReference: 'SFG-003', typeInternalReference: 'SFG', bomLine: 'RM-008', bomLineName: 'Filtered Water',    typeBOMLine: 'RM', quantity: 0.85 },
    // FG-007 = Cheese Crackers
    { internalReference: 'FG-007', typeInternalReference: 'FG', bomLine: 'SFG-004', bomLineName: 'Cracker Dough',      typeBOMLine: 'SFG', quantity: 0.18 },
    { internalReference: 'FG-007', typeInternalReference: 'FG', bomLine: 'SFG-005', bomLineName: 'Cheese Coating',     typeBOMLine: 'SFG', quantity: 0.04 },
    { internalReference: 'FG-007', typeInternalReference: 'FG', bomLine: 'PK-004',  bomLineName: 'Foil Bag 200g',      typeBOMLine: 'PK',  quantity: 1    },
    { internalReference: 'SFG-004', typeInternalReference: 'SFG', bomLine: 'RM-009', bomLineName: 'Wheat Flour',       typeBOMLine: 'RM', quantity: 0.12 },
    { internalReference: 'SFG-004', typeInternalReference: 'SFG', bomLine: 'RM-010', bomLineName: 'Palm Oil',          typeBOMLine: 'RM', quantity: 0.04 },
    { internalReference: 'SFG-004', typeInternalReference: 'SFG', bomLine: 'RM-011', bomLineName: 'Salt',              typeBOMLine: 'RM', quantity: 0.005 },
    { internalReference: 'SFG-005', typeInternalReference: 'SFG', bomLine: 'RM-012', bomLineName: 'Cheddar Powder',    typeBOMLine: 'RM', quantity: 0.025 },
    { internalReference: 'SFG-005', typeInternalReference: 'SFG', bomLine: 'INT-002', bomLineName: 'Flavour Blend',    typeBOMLine: 'INT', quantity: 0.015 },
    { internalReference: 'INT-002', typeInternalReference: 'INT', bomLine: 'RM-013', bomLineName: 'Yeast Extract',     typeBOMLine: 'RM', quantity: 0.5  },
    { internalReference: 'INT-002', typeInternalReference: 'INT', bomLine: 'RM-014', bomLineName: 'Paprika Extract',   typeBOMLine: 'RM', quantity: 0.5  },
  ]
}

export function generateMockPrices(): PriceItem[] {
  return [
    { itemCode: 'RM-001', itemName: 'Raw Whole Milk',      itemType: 'RM', unitCostUSD: 0.45 },
    { itemCode: 'RM-002', itemName: 'Cream',               itemType: 'RM', unitCostUSD: 1.20 },
    { itemCode: 'RM-003', itemName: 'Sugar',               itemType: 'RM', unitCostUSD: 0.55 },
    { itemCode: 'RM-004', itemName: 'Carrageenan',         itemType: 'RM', unitCostUSD: 8.50 },
    { itemCode: 'RM-005', itemName: 'Guar Gum',            itemType: 'RM', unitCostUSD: 3.20 },
    { itemCode: 'RM-006', itemName: 'Skim Powder',         itemType: 'RM', unitCostUSD: 2.80 },
    { itemCode: 'RM-007', itemName: 'OJ Concentrate',      itemType: 'RM', unitCostUSD: 1.85 },
    { itemCode: 'RM-008', itemName: 'Filtered Water',      itemType: 'RM', unitCostUSD: 0.02 },
    { itemCode: 'RM-009', itemName: 'Wheat Flour',         itemType: 'RM', unitCostUSD: 0.40 },
    { itemCode: 'RM-010', itemName: 'Palm Oil',            itemType: 'RM', unitCostUSD: 0.95 },
    { itemCode: 'RM-011', itemName: 'Salt',                itemType: 'RM', unitCostUSD: 0.15 },
    { itemCode: 'RM-012', itemName: 'Cheddar Powder',      itemType: 'RM', unitCostUSD: 7.20 },
    { itemCode: 'RM-013', itemName: 'Yeast Extract',       itemType: 'RM', unitCostUSD: 4.50 },
    { itemCode: 'RM-014', itemName: 'Paprika Extract',     itemType: 'RM', unitCostUSD: 6.80 },
    { itemCode: 'PK-001', itemName: 'PET Bottle 1L',       itemType: 'PK', unitCostUSD: 0.18 },
    { itemCode: 'PK-002', itemName: 'Label Adhesive',      itemType: 'PK', unitCostUSD: 0.03 },
    { itemCode: 'PK-003', itemName: 'Tetra Pak 1L',        itemType: 'PK', unitCostUSD: 0.32 },
    { itemCode: 'PK-004', itemName: 'Foil Bag 200g',       itemType: 'PK', unitCostUSD: 0.12 },
    { itemCode: 'SFG-001', itemName: 'Processed Milk Base', itemType: 'SFG', unitCostUSD: 0 },
    { itemCode: 'SFG-002', itemName: 'Skimmed Milk Base',  itemType: 'SFG', unitCostUSD: 0 },
    { itemCode: 'SFG-003', itemName: 'OJ Concentrate Mix', itemType: 'SFG', unitCostUSD: 0 },
    { itemCode: 'SFG-004', itemName: 'Cracker Dough',      itemType: 'SFG', unitCostUSD: 0 },
    { itemCode: 'SFG-005', itemName: 'Cheese Coating',     itemType: 'SFG', unitCostUSD: 0 },
    { itemCode: 'INT-001', itemName: 'Stabilizer Mix',     itemType: 'INT', unitCostUSD: 0 },
    { itemCode: 'INT-002', itemName: 'Flavour Blend',      itemType: 'INT', unitCostUSD: 0 },
  ]
}

export function generateMockWeightExpenses(): WeightExpense[] {
  return [
    { fromWeight: 0.01, toWeight: 0.99, expenseUSD: 0.10 },
    { fromWeight: 1.00, toWeight: 1.99, expenseUSD: 0.15 },
    { fromWeight: 2.00, toWeight: 7.99, expenseUSD: 0.75 },
    { fromWeight: 8.00, toWeight: 15.99, expenseUSD: 1.00 },
    { fromWeight: 16.00, toWeight: 30.00, expenseUSD: 1.55 },
  ]
}
