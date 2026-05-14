import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, UploadedFiles, AppSettings } from '@/types'
import { computeAllProducts } from '@/lib/costing/engine'
import {
  generateMockProfitability,
  generateMockBOM,
  generateMockPrices,
  generateMockWeightExpenses,
} from '@/lib/utils/parsers'

const DEFAULT_SETTINGS: AppSettings = {
  usdToLydRate: 4.85,
  currency: 'USD',
  theme: 'light',
}

const EMPTY_FILES: UploadedFiles = {
  profitability: null,
  bom: null,
  prices: null,
  weightExpenses: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      files: EMPTY_FILES,
      settings: DEFAULT_SETTINGS,
      computedProducts: [],
      isComputing: false,
      error: null,

      setFile: (key, data) => {
        set(s => ({ files: { ...s.files, [key]: data }, error: null }))
        // Auto-compute if all files present
        const { files } = get()
        const updated = { ...files, [key]: data }
        if (updated.profitability && updated.bom && updated.prices && updated.weightExpenses) {
          get().compute()
        }
      },

      setSettings: (partial) => {
        set(s => ({ settings: { ...s.settings, ...partial } }))
      },

      compute: () => {
        const { files } = get()
        if (!files.profitability || !files.bom || !files.prices || !files.weightExpenses) return
        set({ isComputing: true, error: null })
        try {
          const products = computeAllProducts(
            files.profitability,
            files.bom,
            files.prices,
            files.weightExpenses,
          )
          set({ computedProducts: products, isComputing: false })
        } catch (e) {
          set({ error: String(e), isComputing: false })
        }
      },

      reset: () => set({ files: EMPTY_FILES, computedProducts: [], error: null }),
    }),
    {
      name: 'mfg-costing-store',
      partialize: state => ({ settings: state.settings }),
    },
  ),
)

// ─── Load mock data helper ────────────────────────────────────────────────────

export function loadMockData() {
  const store = useAppStore.getState()
  store.setFile('profitability', generateMockProfitability())
  store.setFile('bom', generateMockBOM())
  store.setFile('prices', generateMockPrices())
  store.setFile('weightExpenses', generateMockWeightExpenses())
}
