import { create } from 'zustand'
import { defaultScenarioPreset, scenarioPresets } from '@/data/scenarios'
import { createJourneyScenario, resolveScenarioPreset, selectJourneyOption } from '@/lib/journey'
import type { JourneyScenario, JourneyScenarioPreset, ScenarioMatchMeta } from '@/types/journey'

export type FlowStage = 'home' | 'loading' | 'journey' | 'result'

type AppState = {
  draftLink: string
  scenarioCatalog: JourneyScenarioPreset[]
  activeScenarioId: string
  matchMeta: ScenarioMatchMeta
  scenario: JourneyScenario
  flowStage: FlowStage
  setDraftLink: (value: string) => void
  resolveScenarioByDraftLink: (value?: string) => void
  setActiveScenario: (scenarioId: string) => void
  selectNodeOption: (nodeId: string, optionId: string) => void
  resetScenarioProgress: () => void
  setFlowStage: (stage: FlowStage) => void
}

const initialResolved = resolveScenarioPreset('', scenarioPresets)
const initialScenario = createJourneyScenario(initialResolved.preset, initialResolved.matchMeta)

export const useAppStore = create<AppState>((set, get) => ({
  draftLink: '',
  scenarioCatalog: scenarioPresets,
  activeScenarioId: initialScenario.id,
  matchMeta: initialResolved.matchMeta,
  scenario: initialScenario,
  flowStage: 'home',
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
  setFlowStage: (stage) => set({ flowStage: stage }),
}))
