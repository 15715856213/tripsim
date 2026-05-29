import type {
  BudgetSnapshot,
  JourneyScenario,
  JourneyScenarioPreset,
  JourneySettlement,
  RouteNode,
  ScenarioMatchMeta,
  TraitKey,
  TraitScores,
  TraitSummary,
} from '@/types/journey'

const TRAIT_LABELS: Record<TraitKey, string> = {
  budgeter: '预算掌控',
  speedrunner: '速通执行',
  refined: '体验精致',
}

const TRAIT_DESCRIPTORS: Record<TraitKey, string> = {
  budgeter: '擅长把钱花在刀刃上',
  speedrunner: '更关注效率与路线压缩',
  refined: '优先追求舒适和氛围感',
}

const TRAIT_PERSONAS: Record<TraitKey, string> = {
  budgeter: '穷游算盘型',
  speedrunner: '特种兵速通型',
  refined: '精致松弛型',
}

const DEFAULT_TRAITS: TraitScores = {
  budgeter: 50,
  speedrunner: 50,
  refined: 50,
}

export function normalizeKeywordText(value: string) {
  const decoded = safeDecodeURIComponent(value)

  return decoded
    .toLowerCase()
    .replace(/https?:\/\//g, ' ')
    .replace(/[/?#&=_\-+.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function resolveScenarioPreset(source: string, presets: JourneyScenarioPreset[]) {
  const normalizedSource = normalizeKeywordText(source)
  const scoredPresets = presets.map((preset) => {
    const matchedKeywords = new Set<string>()
    let keywordScore = 0

    preset.keywords.forEach((keyword) => {
      if (normalizedSource.includes(keyword.toLowerCase())) {
        matchedKeywords.add(keyword)
        keywordScore += 10
      }
    })

    preset.keywordRules?.forEach((rule) => {
      const ruleHits = rule.keywords.filter((keyword) => normalizedSource.includes(keyword.toLowerCase()))

      if (ruleHits.length >= (rule.minHits ?? 1)) {
        ruleHits.forEach((keyword) => matchedKeywords.add(keyword))
        keywordScore += rule.score
      }
    })

    return {
      preset,
      matchMeta: {
        strategy: keywordScore > 0 ? 'keyword' : 'default-fallback',
        matchedKeywords: Array.from(matchedKeywords),
        keywordScore,
        resolvedFrom: normalizedSource,
      } satisfies ScenarioMatchMeta,
    }
  })

  const matchedPreset = scoredPresets
    .filter((item) => item.matchMeta.keywordScore > 0)
    .sort((left, right) => right.matchMeta.keywordScore - left.matchMeta.keywordScore)[0]

  if (matchedPreset) {
    return matchedPreset
  }

  const fallbackPreset = presets.find((preset) => preset.isDefault) ?? presets[0]

  return {
    preset: fallbackPreset,
    matchMeta: {
      strategy: 'default-fallback',
      matchedKeywords: [],
      keywordScore: 0,
      resolvedFrom: normalizedSource,
    } satisfies ScenarioMatchMeta,
  }
}

export function createJourneyScenario(preset: JourneyScenarioPreset, matchMeta: ScenarioMatchMeta): JourneyScenario {
  const nodes = normalizeRouteNodes(preset.nodes)
  const traits = calculateTraits(preset.baseTraits, nodes)
  const spent = calculateSpent(nodes)
  const budgetSnapshot = createBudgetSnapshot(preset.budget, spent)
  const traitSummary = createTraitSummary(traits)
  const settlement = createSettlement(preset, spent, traits, nodes, budgetSnapshot)

  return {
    id: preset.id,
    title: preset.title,
    description: preset.description,
    budget: preset.budget,
    spent,
    baseTraits: createBaseTraits(preset.baseTraits),
    traits,
    traitSummary,
    budgetSnapshot,
    nodes,
    settlement,
    matchMeta,
  }
}

export function selectJourneyOption(scenario: JourneyScenario, nodeId: string, optionId: string) {
  const nextNodes = normalizeRouteNodes(
    scenario.nodes.map((node) => {
      if (node.id !== nodeId) {
        return {
          ...node,
          initialSelectedOptionId: node.progress.selectedOptionId,
        }
      }

      if (node.progress.status === 'locked') {
        return {
          ...node,
          initialSelectedOptionId: node.progress.selectedOptionId,
        }
      }

      return {
        ...node,
        initialSelectedOptionId: optionId,
      }
    }),
  )

  const traits = calculateTraits(scenario.baseTraits, nextNodes)
  const spent = calculateSpent(nextNodes)
  const budgetSnapshot = createBudgetSnapshot(scenario.budget, spent)

  return {
    ...scenario,
    spent,
    traits,
    traitSummary: createTraitSummary(traits),
    budgetSnapshot,
    nodes: nextNodes,
    settlement: createSettlement(
      {
        title: scenario.title,
        nodes: nextNodes,
      },
      spent,
      traits,
      nextNodes,
      budgetSnapshot,
    ),
  }
}

function normalizeRouteNodes(nodes: JourneyScenarioPreset['nodes'] | JourneyScenario['nodes']): RouteNode[] {
  let currentAssigned = false

  return nodes.map((node, index) => {
    const selectedOptionId = node.initialSelectedOptionId ?? node.progress?.selectedOptionId
    const status = selectedOptionId
      ? 'completed'
      : currentAssigned
        ? 'locked'
        : assignCurrentStatus(() => {
            currentAssigned = true
            return 'current'
          })

    return {
      ...node,
      initialSelectedOptionId: selectedOptionId,
      progress: {
        order: index + 1,
        status,
        selectedOptionId,
        availableOptionIds: node.event.options.map((option) => option.id),
      },
    }
  })
}

function assignCurrentStatus(factory: () => 'current') {
  return factory()
}

function calculateSpent(nodes: RouteNode[]) {
  return nodes.reduce((total, node) => total + (findSelectedOption(node)?.cost ?? 0), 0)
}

function calculateTraits(baseTraits: Partial<TraitScores> | TraitScores | undefined, nodes: RouteNode[]) {
  const traits = createBaseTraits(baseTraits)

  nodes.forEach((node) => {
    const selectedOption = findSelectedOption(node)

    if (!selectedOption?.traitDelta) {
      return
    }

    ;(Object.entries(selectedOption.traitDelta) as Array<[TraitKey, number]>).forEach(([key, delta]) => {
      traits[key] += delta
    })
  })

  return traits
}

function createBaseTraits(baseTraits?: Partial<TraitScores> | TraitScores) {
  return {
    budgeter: DEFAULT_TRAITS.budgeter + (baseTraits?.budgeter ?? 0),
    speedrunner: DEFAULT_TRAITS.speedrunner + (baseTraits?.speedrunner ?? 0),
    refined: DEFAULT_TRAITS.refined + (baseTraits?.refined ?? 0),
  }
}

function createTraitSummary(traits: TraitScores): TraitSummary[] {
  return (Object.keys(traits) as TraitKey[]).map((key) => ({
    key,
    label: TRAIT_LABELS[key],
    descriptor: TRAIT_DESCRIPTORS[key],
    score: traits[key],
  }))
}

function createBudgetSnapshot(total: number, spent: number): BudgetSnapshot {
  const remaining = total - spent
  const usageRate = total === 0 ? 0 : Number((spent / total).toFixed(2))

  return {
    total,
    spent,
    remaining,
    usageRate,
    status: remaining < 0 ? 'overspent' : usageRate >= 0.8 ? 'warning' : 'safe',
  }
}

function createSettlement(
  preset: Pick<JourneyScenarioPreset, 'title' | 'nodes' | 'settlementTemplate'>,
  spent: number,
  traits: TraitScores,
  nodes: RouteNode[],
  budgetSnapshot: BudgetSnapshot,
): JourneySettlement {
  const dominantTrait = getDominantTrait(traits)
  const completedNodes = nodes.filter((node) => node.progress.status === 'completed').length
  const totalNodes = preset.nodes.length

  return {
    title: preset.settlementTemplate?.title ?? `《${preset.title}结算》`,
    summary:
      preset.settlementTemplate?.summary ??
      `当前完成 ${completedNodes}/${totalNodes} 个节点，预算状态为 ${translateBudgetStatus(
        budgetSnapshot.status,
      )}，人格倾向偏向 ${TRAIT_LABELS[dominantTrait]}。`,
    totalSpent: spent,
    remainingBudget: budgetSnapshot.remaining,
    completedNodes,
    totalNodes,
    dominantTrait,
    personaLabel: TRAIT_PERSONAS[dominantTrait],
    budgetStatus: budgetSnapshot.status,
    badges: createSettlementBadges(budgetSnapshot, traits, completedNodes, totalNodes),
  }
}

function createSettlementBadges(
  budgetSnapshot: BudgetSnapshot,
  traits: TraitScores,
  completedNodes: number,
  totalNodes: number,
) {
  const badges = []

  if (budgetSnapshot.remaining >= budgetSnapshot.total * 0.4) {
    badges.push({ id: 'budget-master', label: '预算管理大师' })
  }

  if (traits.speedrunner >= 65) {
    badges.push({ id: 'speed-clear', label: '路线速通选手' })
  }

  if (traits.refined >= 65) {
    badges.push({ id: 'refined-player', label: '氛围体验派' })
  }

  if (completedNodes === totalNodes) {
    badges.push({ id: 'full-clear', label: '全节点打卡' })
  }

  if (badges.length === 0) {
    badges.push({ id: 'warm-up', label: '试玩热身中' })
  }

  return badges
}

function getDominantTrait(traits: TraitScores): TraitKey {
  return (Object.entries(traits) as Array<[TraitKey, number]>).sort((left, right) => right[1] - left[1])[0][0]
}

function findSelectedOption(node: Pick<RouteNode, 'event' | 'progress'>) {
  return node.event.options.find((option) => option.id === node.progress.selectedOptionId)
}

function translateBudgetStatus(status: BudgetSnapshot['status']) {
  if (status === 'overspent') {
    return '超支'
  }

  if (status === 'warning') {
    return '预警'
  }

  return '安全'
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
