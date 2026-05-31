import { create } from 'zustand'
import { defaultScenarioPreset, scenarioPresets } from '@/data/scenarios'
import { createJourneyScenario, resolveScenarioPreset, selectJourneyOption } from '@/lib/journey'
import type { JourneyScenario, JourneyScenarioPreset, ScenarioMatchMeta } from '@/types/journey'
import type { SelectionMap } from '@/lib/analysis'

export type FlowStage = 'home' | 'loading' | 'journey' | 'result' | 'wenzhou-budget' | 'wenzhou-sim'

type WenzhouSimBudgetSnapshot = {
  budget: number
  spent: number
  remaining: number
}

type AppState = {
  draftLink: string
  scenarioCatalog: JourneyScenarioPreset[]
  activeScenarioId: string
  matchMeta: ScenarioMatchMeta
  scenario: JourneyScenario
  flowStage: FlowStage
  wenzhouSimBudget: number
  wenzhouSimSavedSnapshot: WenzhouSimBudgetSnapshot | null
  wenzhouSimSelections: SelectionMap | null
  setDraftLink: (value: string) => void
  resolveScenarioByDraftLink: (value?: string) => void
  setActiveScenario: (scenarioId: string) => void
  selectNodeOption: (nodeId: string, optionId: string) => void
  resetScenarioProgress: () => void
  setFlowStage: (stage: FlowStage) => void
  setWenzhouSimBudget: (value: number) => void
  saveWenzhouSimSnapshot: (value: WenzhouSimBudgetSnapshot) => void
  saveWenzhouSimSelections: (value: SelectionMap) => void
}

const initialResolved = resolveScenarioPreset('', scenarioPresets)
const initialScenario = createJourneyScenario(initialResolved.preset, initialResolved.matchMeta)

const normalizePathname = (pathname: string) => {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') return pathname
  const baseNoTrailingSlash = base.endsWith('/') ? base.slice(0, -1) : base
  if (!baseNoTrailingSlash) return pathname
  if (pathname === baseNoTrailingSlash) return '/'
  if (pathname.startsWith(baseNoTrailingSlash + '/')) return pathname.slice(baseNoTrailingSlash.length)
  return pathname
}

const resolveInitialFlowStage = (): FlowStage => {
  if (typeof window === 'undefined') return 'home'

  const pathname = normalizePathname(window.location.pathname || '/')
  if (pathname.startsWith('/loading')) return 'loading'
  if (pathname.startsWith('/journey')) return 'journey'
  if (pathname.startsWith('/result')) return 'result'
  if (pathname.startsWith('/wenzhou-budget')) return 'wenzhou-budget'
  if (pathname.startsWith('/wenzhou-sim')) return 'wenzhou-sim'

  try {
    const stored = window.localStorage.getItem('flowStage') as FlowStage | null
    if (
      stored === 'home' ||
      stored === 'loading' ||
      stored === 'journey' ||
      stored === 'result' ||
      stored === 'wenzhou-budget' ||
      stored === 'wenzhou-sim'
    ) {
      return stored
    }
  } catch {
    return 'home'
  }

  return 'home'
}

const loadWenzhouSimSnapshot = (): WenzhouSimBudgetSnapshot | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem('wenzhouSimSnapshot')
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<WenzhouSimBudgetSnapshot> | null
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    if (
      typeof parsed.budget !== 'number' ||
      typeof parsed.spent !== 'number' ||
      typeof parsed.remaining !== 'number' ||
      !Number.isFinite(parsed.budget) ||
      !Number.isFinite(parsed.spent) ||
      !Number.isFinite(parsed.remaining)
    ) {
      return null
    }

    return {
      budget: parsed.budget,
      spent: parsed.spent,
      remaining: parsed.remaining,
    }
  } catch {
    return null
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  draftLink: '',
  scenarioCatalog: scenarioPresets,
  activeScenarioId: initialScenario.id,
  matchMeta: initialResolved.matchMeta,
  scenario: initialScenario,
  flowStage: resolveInitialFlowStage(),
  wenzhouSimBudget: 300,
  wenzhouSimSavedSnapshot: loadWenzhouSimSnapshot(),
  wenzhouSimSelections: null,
  setDraftLink: (value) => {
    const resolved = resolveScenarioPreset(value, get().scenarioCatalog)

    set({
      draftLink: value,
      activeScenarioId: resolved.preset.id,
      matchMeta: resolved.matchMeta,
      scenario: createJourneyScenario(resolved.preset, resolved.matchMeta),
    })
  },
  resolveScenarioByDraftLink: (value) => {
    const source = value ?? get().draftLink
    const resolved = resolveScenarioPreset(source, get().scenarioCatalog)

    set({
      draftLink: source,
      activeScenarioId: resolved.preset.id,
      matchMeta: resolved.matchMeta,
      scenario: createJourneyScenario(resolved.preset, resolved.matchMeta),
    })
  },
  setActiveScenario: (scenarioId) => {
    const preset = get().scenarioCatalog.find((item) => item.id === scenarioId) ?? defaultScenarioPreset
    const matchMeta = get().draftLink
      ? resolveScenarioPreset(get().draftLink, get().scenarioCatalog).matchMeta
      : {
          strategy: 'default-fallback',
          matchedKeywords: [],
          keywordScore: 0,
          resolvedFrom: '',
        } satisfies ScenarioMatchMeta

    set({
      activeScenarioId: preset.id,
      matchMeta,
      scenario: createJourneyScenario(preset, matchMeta),
    })
  },
  selectNodeOption: (nodeId, optionId) => {
    set((state) => ({
      scenario: selectJourneyOption(state.scenario, nodeId, optionId),
    }))
  },
  resetScenarioProgress: () => {
    const state = get()
    const preset = state.scenarioCatalog.find((item) => item.id === state.activeScenarioId) ?? defaultScenarioPreset

    set({
      scenario: createJourneyScenario(preset, state.matchMeta),
    })
  },
  setFlowStage: (stage) => {
    set({ flowStage: stage })
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem('flowStage', stage)
    } catch {
      return
    }
  },
  setWenzhouSimBudget: (value) => set({ wenzhouSimBudget: value }),
  saveWenzhouSimSnapshot: (value) => {
    set({ wenzhouSimSavedSnapshot: value })
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem('wenzhouSimSnapshot', JSON.stringify(value))
    } catch {
      return
    }
  },
  saveWenzhouSimSelections: (value) => set({ wenzhouSimSelections: value }),
}))
