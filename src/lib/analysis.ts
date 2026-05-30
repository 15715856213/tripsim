import {
  budgetCopies,
  scriptNodes,
  type BudgetState,
  type DecisionVector,
  type RouteOption,
  type ScriptNode,
} from '../data/travelScript'

export type SelectionMap = Record<string, string>

type StepChoiceContext = {
  budget: number
  spentBeforeChoice: number
  currentNode: ScriptNode
  chosenOption: RouteOption
  selections: SelectionMap
}

export type StepInsight = {
  budgetState: BudgetState
  coachLine: string
  pressureLabel: string
  projectedNote: string
  bufferNote: string
  experienceNote: string
  bestFor: string
  watchout: string
}

export type JourneySummary = {
  archetype: string
  title: string
  description: string
  budgetState: BudgetState
  score: number
  highlights: string[]
  totals: DecisionVector
}

const emptyVector = (): DecisionVector => ({
  comfort: 0,
  local: 0,
  photo: 0,
  savings: 0,
  efficiency: 0,
  ritual: 0,
})

export const getOptionById = (node: ScriptNode, optionId?: string) =>
  node.options.find((option) => option.id === optionId)

export const calculateSpent = (selections: SelectionMap) =>
  scriptNodes.reduce((total, node) => {
    const chosen = getOptionById(node, selections[node.id])
    return total + (chosen?.price ?? 0)
  }, 0)

export const getRemainingBudget = (budget: number, spent: number) => budget - spent

export const getBudgetState = (budget: number, spent: number): BudgetState => {
  if (spent > budget) {
    return 'over'
  }

  const ratio = budget <= 0 ? 0 : (budget - spent) / budget

  if (ratio >= 0.6) {
    return 'abundant'
  }

  if (ratio >= 0.3) {
    return 'healthy'
  }

  return 'tight'
}

const sumRemainingCost = (
  currentNodeId: string,
  selections: SelectionMap,
  mode: 'min' | 'recommended',
) =>
  scriptNodes.reduce((total, node) => {
    if (node.id === currentNodeId || selections[node.id]) {
      return total
    }

    if (mode === 'min') {
      return total + Math.min(...node.options.map((option) => option.price))
    }

    const recommended = node.options.find((option) => option.recommended) ?? node.options[0]
    return total + recommended.price
  }, 0)

const formatMoney = (amount: number) => `¥${Math.abs(amount)}`

const getCoachCopy = (state: BudgetState, seed: number) => {
  const copies = budgetCopies[state]
  return copies[Math.abs(seed) % copies.length]
}

const getExperienceEmphasis = (vector: DecisionVector) => {
  const entries = Object.entries(vector).sort((a, b) => b[1] - a[1])
  const top = entries[0]?.[0]

  switch (top) {
    case 'local':
      return '这一步更偏向“在地体验”，会让整条路线更像真正的温州漫游。'
    case 'photo':
      return '这一步会明显拉高路线的视觉记忆点，更适合做内容传播和拍照留念。'
    case 'comfort':
      return '这一步更强调舒适与享受，适合把体感放在预算之前。'
    case 'savings':
      return '这一步非常克制，会给后续节点留出更大的预算回旋空间。'
    case 'efficiency':
      return '这一步更像成熟攻略型选择，重视节奏、效率和少踩坑。'
    default:
      return '这一步的价值在于仪式感，它会让这一天更像一个完整作品。'
  }
}

export const getStepInsight = ({
  budget,
  spentBeforeChoice,
  currentNode,
  chosenOption,
  selections,
}: StepChoiceContext): StepInsight => {
  const spentAfterChoice = spentBeforeChoice + chosenOption.price
  const remaining = budget - spentAfterChoice
  const futureMin = sumRemainingCost(currentNode.id, selections, 'min')
  const futureRecommended = sumRemainingCost(currentNode.id, selections, 'recommended')
  const projectedRecommendedGap = budget - (spentAfterChoice + futureRecommended)
  const budgetState = getBudgetState(budget, spentAfterChoice)

  let pressureLabel = '游刃有余'
  if (projectedRecommendedGap < 0) {
    pressureLabel = '高压预警'
  } else if (remaining - futureMin < 30) {
    pressureLabel = '轻度收紧'
  } else if (remaining - futureRecommended < 50) {
    pressureLabel = '进入中场'
  }

  const projectedNote =
    projectedRecommendedGap >= 0
      ? `如果后续继续按推荐路线走，最终还能留出 ${formatMoney(projectedRecommendedGap)} 的机动金。`
      : `如果后续继续按推荐路线走，最终大概率会超预算 ${formatMoney(projectedRecommendedGap)}。`

  const bufferGap = remaining - futureMin
  const bufferNote =
    bufferGap >= 0
      ? `按后续最低成本通关，你还保有 ${formatMoney(bufferGap)} 的缓冲。`
      : `即使后续全部选择最低成本路线，仍会超出 ${formatMoney(bufferGap)}。`

  return {
    budgetState,
    coachLine: `${getCoachCopy(
      budgetState,
      spentAfterChoice + currentNode.order,
    )} ${chosenOption.watchout}`,
    pressureLabel,
    projectedNote,
    bufferNote,
    experienceNote: getExperienceEmphasis(chosenOption.vector),
    bestFor: chosenOption.bestFor,
    watchout: chosenOption.watchout,
  }
}

export const getCompletionRatio = (selections: SelectionMap) => {
  const completed = scriptNodes.filter((node) => selections[node.id]).length
  return completed / scriptNodes.length
}

export const getRecommendedTotal = () =>
  scriptNodes.reduce((total, node) => {
    const recommended = node.options.find((option) => option.recommended) ?? node.options[0]
    return total + recommended.price
  }, 0)

export const getMinimumTotal = () =>
  scriptNodes.reduce(
    (total, node) => total + Math.min(...node.options.map((option) => option.price)),
    0,
  )

export const getMaximumTotal = () =>
  scriptNodes.reduce(
    (total, node) => total + Math.max(...node.options.map((option) => option.price)),
    0,
  )

const addVectors = (left: DecisionVector, right: DecisionVector) => ({
  comfort: left.comfort + right.comfort,
  local: left.local + right.local,
  photo: left.photo + right.photo,
  savings: left.savings + right.savings,
  efficiency: left.efficiency + right.efficiency,
  ritual: left.ritual + right.ritual,
})

const getVectorTotals = (selections: SelectionMap) =>
  scriptNodes.reduce((totals, node) => {
    const chosen = getOptionById(node, selections[node.id])
    return chosen ? addVectors(totals, chosen.vector) : totals
  }, emptyVector())

export const getJourneySummary = (
  budget: number,
  selections: SelectionMap,
): JourneySummary => {
  const totals = getVectorTotals(selections)
  const spent = calculateSpent(selections)
  const budgetState = getBudgetState(budget, spent)
  const completed = scriptNodes.filter((node) => selections[node.id]).length
  const completion = completed / scriptNodes.length

  const scoreBase =
    72 +
    totals.local * 1.4 +
    totals.efficiency * 1.2 +
    totals.ritual +
    totals.photo * 0.8 +
    Math.max(0, totals.savings * 0.7) -
    Math.max(0, spent - budget) * 0.22

  const score = Math.max(45, Math.min(99, Math.round(scoreBase * Math.max(0.65, completion))))

  let archetype = '均衡漫游派'
  let title = '预算与体验正在同频'
  let description =
    '你更像一个成熟的城市漫游策展人，会把花钱、节奏和记忆点放在同一张图上统筹。'

  if (totals.local >= totals.photo && totals.local >= totals.ritual && totals.local >= totals.comfort) {
    archetype = '本地深潜派'
    title = '你选的是“这座城市本来的样子”'
    description =
      '你倾向把预算投给真实的在地体验，而不是表面上的热闹，这让路线很有温州自己的味道。'
  } else if (totals.ritual >= totals.savings && totals.ritual >= totals.efficiency) {
    archetype = '仪式感收藏家'
    title = '你在为这一天制造值得回看的章节'
    description =
      '你更愿意为氛围、情绪和完整结尾付费，这种路线很适合做纪念日、情侣线或精品产品。'
  } else if (totals.savings >= totals.comfort && totals.savings >= totals.photo) {
    archetype = '克制攻略派'
    title = '你把钱花在了真正有差异化的地方'
    description =
      '你擅长把有限预算留给关键节点，路线更像成熟攻略产品，适合预算敏感但依然想玩得明白的人。'
  } else if (totals.photo >= totals.local && totals.photo >= totals.savings) {
    archetype = '内容出片派'
    title = '这条路线天然适合传播和分享'
    description =
      '你的路线选择会更有镜头感和展示感，很适合把网站做成可分享、可种草的产品体验。'
  } else if (totals.comfort >= totals.savings && totals.comfort >= totals.efficiency) {
    archetype = '享受升级派'
    title = '你在追求“花得值”，而不只是“花得少”'
    description =
      '你愿意为舒适和满足感买单，只要预算允许，这会很容易形成高客单的精品路线模板。'
  }

  const highlights = [
    `总花费 ${formatMoney(spent)}，${spent > budget ? `超出预算 ${formatMoney(spent - budget)}` : `剩余 ${formatMoney(budget - spent)}`}`,
    `预算状态：${budgetState === 'abundant' ? '经费充足' : budgetState === 'healthy' ? '比较健康' : budgetState === 'tight' ? '开始紧张' : '已经超支'}`,
    `路线人格：${archetype}`,
  ]

  return {
    archetype,
    title,
    description,
    budgetState,
    score,
    highlights,
    totals,
  }
}

export const getBudgetStateLabel = (state: BudgetState) => {
  switch (state) {
    case 'abundant':
      return '经费充足'
    case 'healthy':
      return '比较健康'
    case 'tight':
      return '开始紧张'
    default:
      return '已经超支'
  }
}
