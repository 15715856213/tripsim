export type TraitKey = 'budgeter' | 'speedrunner' | 'refined'

export type TraitScores = Record<TraitKey, number>

export type NodeCategory = 'transport' | 'food' | 'spot' | 'extra'

export type NodeProgressStatus = 'locked' | 'current' | 'completed'

export type BudgetStatus = 'safe' | 'warning' | 'overspent'

export type ScenarioMatchStrategy = 'keyword' | 'default-fallback'

export type RouteOption = {
  id: string
  label: string
  cost: number
  effectText: string
  traitDelta?: Partial<TraitScores>
  tags?: string[]
}

export type RouteEvent = {
  title: string
  description: string
  options: RouteOption[]
}

export type RouteNodeSeed = {
  id: string
  title: string
  category: NodeCategory
  event: RouteEvent
  initialSelectedOptionId?: string
}

export type RouteNodeProgress = {
  order: number
  status: NodeProgressStatus
  selectedOptionId?: string
  availableOptionIds: string[]
}

export type RouteNode = RouteNodeSeed & {
  progress: RouteNodeProgress
}

export type ScenarioKeywordRule = {
  id: string
  keywords: string[]
  score: number
  minHits?: number
}

export type ScenarioMatchMeta = {
  strategy: ScenarioMatchStrategy
  matchedKeywords: string[]
  keywordScore: number
  resolvedFrom: string
}

export type BudgetSnapshot = {
  total: number
  spent: number
  remaining: number
  usageRate: number
  status: BudgetStatus
}

export type TraitSummary = {
  key: TraitKey
  label: string
  descriptor: string
  score: number
}

export type SettlementBadge = {
  id: string
  label: string
}

export type JourneySettlement = {
  title: string
  summary: string
  totalSpent: number
  remainingBudget: number
  completedNodes: number
  totalNodes: number
  dominantTrait: TraitKey
  personaLabel: string
  budgetStatus: BudgetStatus
  badges: SettlementBadge[]
}

export type JourneyScenarioPreset = {
  id: string
  title: string
  description: string
  keywords: string[]
  keywordRules?: ScenarioKeywordRule[]
  isDefault?: boolean
  budget: number
  baseTraits?: Partial<TraitScores>
  nodes: RouteNodeSeed[]
  settlementTemplate?: {
    title?: string
    summary?: string
  }
}

export type JourneyScenario = {
  id: string
  title: string
  description: string
  budget: number
  spent: number
  baseTraits: TraitScores
  traits: TraitScores
  traitSummary: TraitSummary[]
  budgetSnapshot: BudgetSnapshot
  nodes: RouteNode[]
  settlement: JourneySettlement
  matchMeta: ScenarioMatchMeta
}
