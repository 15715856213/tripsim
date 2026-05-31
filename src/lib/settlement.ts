import { scriptNodes, type ScriptNode } from '../data/travelScript'
import { calculateSpent, getOptionById, type SelectionMap } from './analysis'

export type AchievementCategory = 'hidden' | 'style' | 'budget'

export type Achievement = {
  id: string
  title: string
  description: string
  category: AchievementCategory
  priority: number
  weight: number
  color: string
  icon: string
}

export type TravelPersonality = {
  id: string
  title: string
  description: string
  keywords: string[]
  shareCopy: string
  badgeColor: string
}

type ChosenRoute = {
  node: ScriptNode
  optionId: string
  price: number
}

const itineraryTimes = ['08:30', '10:00', '12:30', '14:00', '16:30', '18:00', '20:00']

const getChosenRoutes = (selections: SelectionMap): ChosenRoute[] =>
  scriptNodes
    .map((node) => {
      const chosen = getOptionById(node, selections[node.id])
      if (!chosen) {
        return null
      }

      return {
        node,
        optionId: chosen.id,
        price: chosen.price,
      }
    })
    .filter((item): item is ChosenRoute => Boolean(item))

const isHighestCostChoice = (node: ScriptNode, optionId: string) => {
  const maxPrice = Math.max(...node.options.map((option) => option.price))
  const chosen = getOptionById(node, optionId)
  return chosen ? chosen.price === maxPrice : false
}

const isFreeChoice = (node: ScriptNode, optionId: string) => {
  const chosen = getOptionById(node, optionId)
  return chosen?.price === 0
}

export const getTravelPersonality = (
  budget: number,
  selections: SelectionMap,
): TravelPersonality => {
  const spent = calculateSpent(selections)
  const isBudgetTravel = spent < 200
  const isWithinBudget = spent <= budget

  if (isBudgetTravel && isWithinBudget) {
    return {
      id: 'rational-traveler',
      title: '理性旅行家',
      description:
        '你知道自己想要什么。不会为了打卡而冲动消费，也不会因为便宜而委屈自己。旅行对你来说，不是花多少钱的问题，而是如何把每一分钱都变成值得的回忆。',
      keywords: ['理性', '克制', '规划型'],
      shareCopy:
        '旅行最厉害的人，不是花得最多的人，而是最知道自己要什么的人。',
      badgeColor: '#8f6ac8',
    }
  }

  if (isBudgetTravel && !isWithinBudget) {
    return {
      id: 'tough-budget-party',
      title: '嘴硬穷游党',
      description:
        '出发前你说这次一定控制预算，旅行中却总能找到“来都来了”的理由。本来只是想看看，结果买了；本来只是路过，结果吃了。预算没守住，快乐倒是一点没少。',
      keywords: ['冲动', '真实', '嘴硬'],
      shareCopy: '本来想穷游，结果败给了“来都来了”。',
      badgeColor: '#ef7d96',
    }
  }

  if (!isBudgetTravel && isWithinBudget) {
    return {
      id: 'clear-headed-player',
      title: '人间清醒玩家',
      description:
        '你愿意为体验买单，但从来不会盲目消费。该省的时候省，该花的时候花。别人是在旅游，你是在经营自己的快乐。',
      keywords: ['精致', '成熟', '自洽'],
      shareCopy: '花钱不可怕，乱花钱才可怕。',
      badgeColor: '#4a8fdf',
    }
  }

  return {
    id: 'master-of-justified-spending',
    title: '来都来了大师',
    description:
      '预算对你来说更像一种建议。你本来只是想看看夜景，结果上了游船；本来只是想随便吃点，结果点了一桌海鲜。你知道这样会超预算，但你更知道，有些快乐是限时供应的。',
    keywords: ['体验至上', '享受派', '氪金玩家'],
    shareCopy: '钱可以再赚，但今天的风景只有今天。',
    badgeColor: '#ff8f2d',
  }
}

export const getUnlockedAchievements = (
  budget: number,
  selections: SelectionMap,
): Achievement[] => {
  const spent = calculateSpent(selections)
  const chosenRoutes = getChosenRoutes(selections)
  const chosenByNode = new Map(chosenRoutes.map((route) => [route.node.id, route.optionId]))
  const freeCount = chosenRoutes.filter((route) => route.price === 0).length
  const highestCostCount = chosenRoutes.filter((route) =>
    isHighestCostChoice(route.node, route.optionId),
  ).length
  const photoFirstCount = chosenRoutes.filter((route) =>
    ['souvenir-shopping', 'instagram-cafe', 'boat-ride', 'night-cruise'].includes(route.optionId),
  ).length
  const paidMealCount = ['breakfast', 'lunch', 'coffee'].filter((nodeId) => {
    const optionId = chosenByNode.get(nodeId)
    const node = scriptNodes.find((item) => item.id === nodeId)
    return optionId && node ? !isFreeChoice(node, optionId) : false
  }).length
  const allHighestCost = chosenRoutes.length === scriptNodes.length && highestCostCount === scriptNodes.length
  const noneHighestCost = chosenRoutes.every((route) => !isHighestCostChoice(route.node, route.optionId))
  const scenicFree =
    chosenByNode.get('jiangxinyu') === 'island-photo-only' &&
    chosenByNode.get('nantang') === 'riverside-walk' &&
    chosenByNode.get('night-view') === 'night-walk'

  const achievements: Achievement[] = []

  if (noneHighestCost) {
    achievements.push({
      id: 'clear-headed',
      title: '人间清醒',
      description: '诱惑很多，但你始终保持理智。',
      category: 'hidden',
      priority: 3,
      weight: 90,
      color: '#72bf63',
      icon: '🔎',
    })
  }

  if (allHighestCost) {
    achievements.push({
      id: 'live-for-today',
      title: '今朝有酒今朝醉',
      description: '明天的事情明天再说，今天先快乐。',
      category: 'hidden',
      priority: 3,
      weight: 95,
      color: '#ff9b42',
      icon: '🍻',
    })
  }

  if (scenicFree) {
    achievements.push({
      id: 'special-observer',
      title: '特种观察员',
      description: '看风景，不一定需要门票。',
      category: 'hidden',
      priority: 3,
      weight: 88,
      color: '#5db6c8',
      icon: '🧭',
    })
  }

  if (spent < 100) {
    achievements.push({
      id: 'wallet-guardian',
      title: '钱包守护者',
      description: '温州玩了一整天，钱包几乎毫发无损。',
      category: 'hidden',
      priority: 3,
      weight: 84,
      color: '#f4a240',
      icon: '👛',
    })
  }

  if (freeCount >= 3) {
    achievements.push({
      id: 'free-master',
      title: '白嫖艺术家',
      description: '免费的东西，往往最香。',
      category: 'style',
      priority: 2,
      weight: 74,
      color: '#3f97e7',
      icon: '🛍️',
    })
  }

  if (highestCostCount >= 3) {
    achievements.push({
      id: 'here-anyway',
      title: '来都来了',
      description: '旅行最大的敌人，就是那句“来都来了”。',
      category: 'style',
      priority: 2,
      weight: 80,
      color: '#f06a59',
      icon: '🎢',
    })
  }

  if (photoFirstCount >= 2) {
    achievements.push({
      id: 'photo-first',
      title: '出片至上',
      description: '风景是给眼睛看的，照片是给朋友圈看的。',
      category: 'style',
      priority: 2,
      weight: 72,
      color: '#f17cb8',
      icon: '📸',
    })
  }

  if (paidMealCount === 3) {
    achievements.push({
      id: 'foodie',
      title: '温州吃货',
      description: '旅行的意义，至少有一半在胃里。',
      category: 'style',
      priority: 2,
      weight: 70,
      color: '#67b05e',
      icon: '🍜',
    })
  }

  if (spent <= budget) {
    achievements.push({
      id: 'budget-master',
      title: '预算控制大师',
      description: '每一分钱都花在计划之内。',
      category: 'budget',
      priority: 1,
      weight: 56,
      color: '#8b6bd1',
      icon: '🧮',
    })
  }

  if (spent <= budget && budget - spent <= 10) {
    achievements.push({
      id: 'limit-goalie',
      title: '极限守门员',
      description: '一分钱都没浪费，你把预算利用到了极致。',
      category: 'budget',
      priority: 1,
      weight: 60,
      color: '#4fb6e8',
      icon: '🥅',
    })
  }

  if (spent > budget) {
    achievements.push({
      id: 'budget-assassin',
      title: '预算刺客',
      description: '预算是用来参考的，不是用来遵守的。',
      category: 'budget',
      priority: 1,
      weight: 66,
      color: '#ff6a52',
      icon: '⚠️',
    })
  }

  if (spent >= budget * 1.5) {
    achievements.push({
      id: 'freedom-officer',
      title: '财务自由体验官',
      description: '快乐的时候，谁还会盯着预算看呢。',
      category: 'budget',
      priority: 1,
      weight: 78,
      color: '#f5a73d',
      icon: '💸',
    })
  }

  return achievements
    .sort((left, right) => {
      if (right.priority !== left.priority) {
        return right.priority - left.priority
      }

      return right.weight - left.weight
    })
    .slice(0, 4)
}

export const getItinerarySummary = (selections: SelectionMap) =>
  scriptNodes.map((node, index) => {
    const option = getOptionById(node, selections[node.id])
    return {
      id: node.id,
      time: itineraryTimes[index] ?? node.time.slice(0, 5),
      title: option?.title ?? '待选择',
      emoji: option ? option.title : node.title,
      optionId: option?.id ?? '',
    }
  })
