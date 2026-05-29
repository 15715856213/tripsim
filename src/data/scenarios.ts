import { createJourneyScenario, resolveScenarioPreset } from '@/lib/journey'
import type { JourneyScenarioPreset } from '@/types/journey'

export const scenarioPresets: JourneyScenarioPreset[] = [
  {
    id: 'chongqing-daytrip',
    title: '重庆一日副本',
    description: '主打山城交通、火锅与江景路线的高热度演示副本。',
    keywords: ['重庆', 'chongqing', '解放碑', '洪崖洞', '李子坝', '山城', '火锅', '轻轨'],
    keywordRules: [
      { id: 'core-city', keywords: ['重庆', 'chongqing', '山城'], score: 20 },
      { id: 'night-view', keywords: ['洪崖洞', '江景'], score: 12, minHits: 1 },
    ],
    budget: 500,
    baseTraits: {
      budgeter: 16,
      speedrunner: 10,
      refined: -6,
    },
    settlementTemplate: {
      summary: '山城路线偏向低成本高密度推进，适合做预算与节点推进演示。',
    },
    nodes: [
      {
        id: 'arrive',
        title: '抵达解放碑',
        category: 'transport',
        initialSelectedOptionId: 'rail',
        event: {
          title: '从机场怎么进城？',
          description: '你刚下飞机，眼前有轻轨、专车和顺风车三个方案。',
          options: [
            { id: 'rail', label: '轻轨转地铁', cost: 12, effectText: '便宜但稍微折腾', traitDelta: { budgeter: 4, speedrunner: -1 } },
            { id: 'taxi', label: '网约车直达', cost: 56, effectText: '省力省时', traitDelta: { refined: 3, budgeter: -2 } },
            { id: 'carpool', label: '顺风车拼座', cost: 26, effectText: '成本适中但要等人齐', traitDelta: { budgeter: 1, speedrunner: -2 } },
          ],
        },
      },
      {
        id: 'food',
        title: '午饭挑战',
        category: 'food',
        initialSelectedOptionId: 'local-hotpot',
        event: {
          title: '第一顿吃什么？',
          description: '你在苍蝇馆、热门江景店和社区火锅馆之间犹豫不决。',
          options: [
            { id: 'local-hotpot', label: '社区老火锅', cost: 56, effectText: '地道扎实，价格还算友好', traitDelta: { budgeter: 2, refined: -1 } },
            { id: 'river-view', label: '江景火锅', cost: 128, effectText: '拍照出片拉满', traitDelta: { refined: 4, budgeter: -3 } },
            { id: 'street-food', label: '小吃拼盘', cost: 32, effectText: '快速补能继续冲点位', traitDelta: { speedrunner: 2, budgeter: 1 } },
          ],
        },
      },
      {
        id: 'spot',
        title: '下午打卡抉择',
        category: 'spot',
        event: {
          title: '先去洪崖洞还是李子坝？',
          description: '时间有限，只能优先锁定一个高热度点位。',
          options: [
            { id: 'hongyadong', label: '洪崖洞夜景线', cost: 40, effectText: '适合氛围和夜景拍摄', traitDelta: { refined: 3 } },
            { id: 'liziba', label: '李子坝穿楼轻轨', cost: 18, effectText: '出片快，路线紧凑', traitDelta: { speedrunner: 3, budgeter: 1 } },
          ],
        },
      },
      {
        id: 'extra',
        title: '宵夜加码',
        category: 'extra',
        event: {
          title: '夜里要不要再来一轮？',
          description: '剩余预算允许你决定是继续体验，还是收手结算。',
          options: [
            { id: 'dessert', label: '甜品收尾', cost: 24, effectText: '旅程更完整，花费适中', traitDelta: { refined: 1 } },
            { id: 'skip', label: '直接回酒店', cost: 0, effectText: '稳住预算，不再加码', traitDelta: { budgeter: 2 } },
          ],
        },
      },
    ],
  },
  {
    id: 'chengdu-weekend',
    title: '成都周末副本',
    description: '覆盖春熙路、熊猫、串串和 citywalk 节奏的双日简版副本。',
    keywords: ['成都', 'chengdu', '春熙路', '太古里', '宽窄巷子', '熊猫', '串串', 'citywalk'],
    keywordRules: [
      { id: 'chengdu-core', keywords: ['成都', 'chengdu', '春熙路', '太古里'], score: 18, minHits: 1 },
      { id: 'food-trip', keywords: ['串串', '火锅'], score: 8, minHits: 1 },
    ],
    budget: 650,
    baseTraits: {
      budgeter: 8,
      speedrunner: 4,
      refined: 10,
    },
    settlementTemplate: {
      summary: '成都副本偏松弛体验，适合验证高预算、精致属性和周末路线数据。',
    },
    nodes: [
      {
        id: 'metro',
        title: '抵达春熙路',
        category: 'transport',
        initialSelectedOptionId: 'metro',
        event: {
          title: '落地后先怎么进城？',
          description: '地铁、接机和共享单车接驳都能到市中心。',
          options: [
            { id: 'metro', label: '地铁快线', cost: 10, effectText: '平衡预算和效率', traitDelta: { budgeter: 1, speedrunner: 1 } },
            { id: 'pickup', label: '接机专车', cost: 68, effectText: '舒适直达', traitDelta: { refined: 3 } },
          ],
        },
      },
      {
        id: 'dinner',
        title: '夜宵串串局',
        category: 'food',
        initialSelectedOptionId: 'skewer',
        event: {
          title: '第一顿夜宵怎么吃？',
          description: '朋友推荐你在热门串串店和私房川菜馆里二选一。',
          options: [
            { id: 'skewer', label: '老牌串串店', cost: 88, effectText: '人均友好，氛围热闹', traitDelta: { budgeter: 1, refined: 1 } },
            { id: 'private', label: '私房川菜馆', cost: 158, effectText: '体验更细致', traitDelta: { refined: 4, budgeter: -2 } },
          ],
        },
      },
      {
        id: 'panda',
        title: '熊猫基地还是 citywalk',
        category: 'spot',
        event: {
          title: '第二天上午怎么安排？',
          description: '早起去熊猫基地，或睡到自然醒再 citywalk。',
          options: [
            { id: 'panda-base', label: '早起冲熊猫基地', cost: 58, effectText: '路线紧凑但体验完整', traitDelta: { speedrunner: 3 } },
            { id: 'taikooli-walk', label: '太古里 citywalk', cost: 22, effectText: '轻松松弛更适合拍照', traitDelta: { refined: 2 } },
          ],
        },
      },
    ],
  },
  {
    id: 'default-citywalk',
    title: '城市漫游万能副本',
    description: '关键词未命中时启用的通用城市副本，用于兜底展示预算、节点和结算结构。',
    keywords: ['旅行', 'vlog', '攻略', '周末', 'citywalk', '打卡'],
    isDefault: true,
    budget: 399,
    baseTraits: {
      budgeter: 10,
      speedrunner: 6,
      refined: 2,
    },
    settlementTemplate: {
      title: '《万能城市漫游结算》',
      summary: '未命中特定城市关键词，已自动回退到通用副本模板。',
    },
    nodes: [
      {
        id: 'transit',
        title: '落地接驳',
        category: 'transport',
        initialSelectedOptionId: 'bus',
        event: {
          title: '先用什么方式抵达市区？',
          description: '默认副本会优先模拟通用交通决策。',
          options: [
            { id: 'bus', label: '机场巴士', cost: 8, effectText: '最稳妥的低成本开局', traitDelta: { budgeter: 2 } },
            { id: 'taxi', label: '出租车', cost: 45, effectText: '省时但更烧预算', traitDelta: { speedrunner: 1, budgeter: -2 } },
          ],
        },
      },
      {
        id: 'coffee',
        title: '补给与开逛',
        category: 'food',
        initialSelectedOptionId: 'cafe',
        event: {
          title: '第一站先补给还是直接开走？',
          description: '默认副本用轻量化节点模拟常见的城市探索行为。',
          options: [
            { id: 'cafe', label: '买杯咖啡再出发', cost: 28, effectText: '节奏从容一些', traitDelta: { refined: 1 } },
            { id: 'walk', label: '直接开始逛', cost: 0, effectText: '把预算留给后面的节点', traitDelta: { speedrunner: 2 } },
          ],
        },
      },
      {
        id: 'landmark',
        title: '城市地标选择',
        category: 'spot',
        event: {
          title: '优先去哪个城市地标？',
          description: '兜底模板同样保留了路线选择与预算累积能力。',
          options: [
            { id: 'museum', label: '博物馆线', cost: 30, effectText: '体验稳定，预算可控', traitDelta: { refined: 1 } },
            { id: 'market', label: '市集线', cost: 18, effectText: '更贴近在地氛围', traitDelta: { budgeter: 1 } },
          ],
        },
      },
    ],
  },
]

export const defaultScenarioPreset = scenarioPresets.find((preset) => preset.isDefault) ?? scenarioPresets[0]

export const demoScenario = createJourneyScenario(defaultScenarioPreset, resolveScenarioPreset('', scenarioPresets).matchMeta)
