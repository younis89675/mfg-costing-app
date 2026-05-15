# Future Cost — Manufacturing Profitability & Costing Platform

Enterprise-grade product costing and profitability analysis system inspired by SAP ERP Product Costing + Power BI.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/          # KPI overview + charts
│   ├── upload/             # 4-file Excel import center
│   ├── analysis/           # Full profitability table + drill-down
│   ├── bom/                # Recursive BOM tree explorer
│   ├── data/               # AG Grid enterprise table
│   └── settings/           # Currency, theme, data management
├── components/
│   ├── layout/             # AppShell, Sidebar, TopNav, ThemeProvider
│   ├── dashboard/          # KPICard
│   ├── upload/             # UploadZone (drag & drop)
│   ├── bom/                # BOMTreeNode (recursive)
│   ├── charts/             # ProfitabilityBarChart, CostBreakdownChart,
│   │                       #   CategoryChart, WaterfallChart
│   └── modals/             # CurrencySettings (floating panel)
├── lib/
│   ├── costing/engine.ts   # Recursive BOM cost engine
│   ├── utils/parsers.ts    # Excel parsers + mock data
│   ├── utils/format.ts     # Currency & number formatters
│   └── store/appStore.ts   # Zustand global state
└── types/index.ts          # All TypeScript models
```

---

## 📊 Excel File Formats

### File 1 — Profitability File
| Column | Example |
|--------|---------|
| Product Category | Dairy |
| Final Product Code | FG-001 |
| Product Name | Full Cream Milk 1L |
| Unit | L |
| Net Weight | 1.02 |
| Company Price | 3.50 |
| Discount % | 5 |

### File 2 — BOM Structure File
| Column | Example |
|--------|---------|
| Internal Reference | FG-001 |
| Type Internal Reference | FG |
| BOM Line | SFG-001 |
| BOM Line Name | Processed Milk Base |
| Type BOM Line | SFG |
| Quantity | 0.95 |

**Supported types:** `FG`, `SFG`, `INT`, `RM`, `PK`

### File 3 — Price File
| Column | Example |
|--------|---------|
| Item Code | RM-001 |
| Item Name | Raw Whole Milk |
| Item Type | RM |
| Unit Cost USD | 0.45 |

### File 4 — Weight Expense File
| Column | Example |
|--------|---------|
| From Weight | 1.00 |
| To Weight | 1.99 |
| Expense USD | 0.15 |

---

## ⚙️ Core Engine Logic

### Recursive BOM Costing

```
Cost(FG) = Σ [ Qty(component) × Cost(component) ]

Where Cost(component) is recursively computed:
  - RM/PK  → Unit price from Price File
  - SFG    → Recursively exploded BOM
  - INT    → Recursively exploded BOM

Circular references → detected and warned, cost = 0
```

### Profitability Formula

```
Net Sale Price        = Company Price × (1 − Discount% / 100)
Total Cost            = Raw Material + Packaging + Semi-Finished + Intermediate + Weight Expense
Profit Before Ins.    = Net Sale Price − Total Cost
Insurance             = Total Cost × 10%
Profit After Ins.     = Profit Before Ins. − Insurance
Profitability %       = (Profit After Ins. / Net Sale Price) × 100
```

### Weight Expense

Bracket lookup: if `From Weight ≤ Net Weight ≤ To Weight` → apply `Expense USD`

---

## 💱 Currency

- All internal calculations in **USD**
- Toggle USD ↔ LYD via floating **Exchange Rate Settings** button (bottom-right)
- Default rate: `1 USD = 4.85 LYD` — fully editable
- Live recalculation across all charts, tables, KPIs

---

## 🎨 Features

| Feature | Details |
|---------|---------|
| Dark / Light mode | Class-based, persisted in localStorage |
| Recursive BOM | Unlimited depth, circular reference protection |
| Drill-down | Click any product → waterfall chart + full BOM tree |
| AG Grid | Sort, filter, export CSV, pagination |
| Charts | Profitability bar, cost breakdown donut, category bar, waterfall |
| Upload | Drag & drop, validation, status, replace files |
| Mock Data | Built-in 12-product sample dataset |
| Settings | Exchange rate, currency toggle, theme |

---

## 🧪 Sample Data

Click **"Load Sample Data"** on the dashboard or upload page to instantly populate with 12 products across 5 categories (Dairy, Beverages, Snacks, Bakery, Condiments) with full multi-level BOMs.
