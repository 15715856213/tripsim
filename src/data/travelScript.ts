export type DecisionVector = {
  comfort: number
  local: number
  photo: number
  savings: number
  efficiency: number
  ritual: number
}

export type RouteOption = {
  id: string
  title: string
  price: number
  description: string
  recommended?: boolean
  tags: string[]
  outcomes: string[]
  bestFor: string
  watchout: string
  vector: DecisionVector
}

export type ScriptNode = {
  id: string
  order: number
  emoji: string
  title: string
  time: string
  location: string
  mission: string
  accent: string
  illustration: string
  options: RouteOption[]
}

export type BudgetState = 'abundant' | 'healthy' | 'tight' | 'over'

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

export const siteMeta = {
  city: '温州',
  title: '温州城市漫游决策副本',
  subtitle:
    '把一张有质感的旅游手绘页面，升级成真正可决策、可分析、可落地的城市漫游产品。',
  dayLength: '1天 · 09:00-21:00',
  transport: '步行为主，跨点打车/公交补位',
  budgetRange: '¥150-300',
}

export const budgetCopies: Record<BudgetState, string[]> = {
  abundant: [
    '经费很充裕~ 今天是来旅行的，不是来受苦的，喜欢就大胆冲吧 ✨',
    '钱包状态满分！遇到心动的体验别犹豫，这一刻的快乐才是最珍贵的。',
  ],
  healthy: [
    '预算走到中场啦，每个选择都开始有自己的分量，慢慢来，享受这个过程~',
    '快乐和预算正在跳一支微妙的舞，保持这份平衡就很棒。',
  ],
  tight: [
    '钱包在轻轻拽你的衣角了~ 接下来的每一步，都可以想想什么对你最重要。',
    '经费有点紧了呢，但最好的风景往往都是免费的，不是吗？',
  ],
  over: [
    '预算已经阵亡了，但快乐好像还活蹦乱跳的~ 来都来了，对吧？',
    '超支了！但谁说旅行一定要按计划来？偶尔任性一次也是回忆的一部分。',
  ],
}

export const scriptNodes: ScriptNode[] = [
  {
    id: 'breakfast',
    order: 1,
    emoji: '🍚',
    title: '温州早餐',
    time: '08:00-09:00',
    location: '五马街附近',
    mission: '开局补能量，别把上午的快乐输给低血糖。',
    accent: '#5ba65b',
    illustration: assetUrl('illustrations/01.jpg'),
    options: [
      {
        id: 'hotel-breakfast',
        title: '酒店自助早餐',
        price: 58,
        description: '慢一点也没关系，今天本来就是来享受的。',
        tags: ['舒适开局', '省心', '仪式感'],
        outcomes: [
          '早餐稳定，体力和情绪都更从容。',
          '不需要额外找店，流程最顺滑。',
          '会稍微压缩白天的消费弹性。',
        ],
        bestFor: '住宿条件不错，想把今天从舒适感开始的人。',
        watchout: '如果总预算偏低，开局就会吃掉一截缓冲。',
        vector: {
          comfort: 5,
          local: 1,
          photo: 1,
          savings: 0,
          efficiency: 4,
          ritual: 3,
        },
      },
      {
        id: 'rice-and-soy',
        title: '温州糯米饭',
        price: 15,
        description: '一天的快乐，从热腾腾的糯米饭开始。',
        recommended: true,
        tags: ['本地感', '高性价比', '稳妥推荐'],
        outcomes: [
          '花费低，但城市体验感很强。',
          '给后面的午餐和夜景保留更多空间。',
          '是“本地派”路线最稳的开局。',
        ],
        bestFor: '想吃到在地风味，又不想预算一早就变紧的人。',
        watchout: '用餐环境不一定精致，更像真实城市生活。',
        vector: {
          comfort: 2,
          local: 5,
          photo: 2,
          savings: 5,
          efficiency: 4,
          ritual: 2,
        },
      },
      {
        id: 'convenience-combo',
        title: '便利店套餐',
        price: 8,
        description: '能吃饱就行，预算要花在刀刃上。',
        tags: ['极简预算', '效率优先', '轻量起步'],
        outcomes: [
          '把钱几乎完整留给后续节点。',
          '适合赶时间或想冲高体验预算的人。',
          '开局体验感偏工具化，不太像旅行。',
        ],
        bestFor: '预算吃紧，或者计划把重头戏留给后面的体验型项目。',
        watchout: '可能会削弱这条路线的“旅行感”和故事性。',
        vector: {
          comfort: 1,
          local: 1,
          photo: 0,
          savings: 5,
          efficiency: 5,
          ritual: 0,
        },
      },
    ],
  },
  {
    id: 'jiangxinyu',
    order: 2,
    emoji: '🏝️',
    title: '江心屿',
    time: '09:30-12:00',
    location: '鹿城区',
    mission: '轻松把“来过温州”的含金量打上去。',
    accent: '#59b6df',
    illustration: assetUrl('illustrations/02.jpg'),
    options: [
      {
        id: 'island-ticket',
        title: '购买门票登岛',
        price: 30,
        description: '既然来了，当然要上岛看看。',
        recommended: true,
        tags: ['经典打卡', '城市地标', '完整体验'],
        outcomes: [
          '把温州的代表性记忆点收入囊中。',
          '步行和停留时间更自然，不会太赶。',
          '是这条路线里性价比很高的“值回票价”节点。',
        ],
        bestFor: '第一次来温州，希望经典地标体验完整的人。',
        watchout: '如果时间被压缩，后面五马街会更像快闪。',
        vector: {
          comfort: 3,
          local: 4,
          photo: 4,
          savings: 3,
          efficiency: 3,
          ritual: 4,
        },
      },
      {
        id: 'island-photo-only',
        title: '江边远观拍照',
        price: 0,
        description: '照片里有它，四舍五入等于来过。',
        tags: ['省时', '零门票', '灵活机动'],
        outcomes: [
          '直接省下门票和登岛时间。',
          '节奏更轻，能给午餐和下午留更大缓冲。',
          '“来过”的仪式感会比登岛稍弱。',
        ],
        bestFor: '对地标执念不高，更看重预算和整体节奏的人。',
        watchout: '如果你很在意代表性体验，后面可能会觉得差一点。',
        vector: {
          comfort: 2,
          local: 2,
          photo: 3,
          savings: 5,
          efficiency: 5,
          ritual: 1,
        },
      },
    ],
  },
  {
    id: 'wuma-street',
    order: 3,
    emoji: '🛍️',
    title: '五马街',
    time: '12:10-13:10',
    location: '五马历史文化街区',
    mission: '逛到“热闹”即可，别被消费冲动偷走下午体力。',
    accent: '#f1a23a',
    illustration: assetUrl('illustrations/03.jpg'),
    options: [
      {
        id: 'souvenir-shopping',
        title: '买纪念品（控额）',
        price: 80,
        description: '总得带点什么回去，证明这趟旅行真实发生过。',
        tags: ['伴手礼', '实物记忆', '消费冲动区'],
        outcomes: [
          '能把“旅程”带回家，完成感更强。',
          '预算会被明显拉高，午餐决策压力上升。',
          '更适合对礼物和纪念意义有明确需求的人。',
        ],
        bestFor: '要给朋友带礼物，或者很在意旅行纪念的人。',
        watchout: '这一笔很容易把中段预算推向紧张区。',
        vector: {
          comfort: 2,
          local: 3,
          photo: 3,
          savings: 0,
          efficiency: 2,
          ritual: 5,
        },
      },
      {
        id: 'window-shopping',
        title: '只逛不买',
        price: 0,
        description: '看看就好，钱包比欲望更坚定。',
        recommended: true,
        tags: ['零压力', '保体力', '预算友好'],
        outcomes: [
          '保留热闹氛围，但不把钱花在最容易后悔的地方。',
          '非常适合把预算集中到吃和夜景。',
          '路线会更像“城市漫游”而不是购物游。',
        ],
        bestFor: '希望整条线更轻盈、更像 city walk 的人。',
        watchout: '如果你本来就想买点什么，临场可能会手痒。',
        vector: {
          comfort: 2,
          local: 3,
          photo: 3,
          savings: 5,
          efficiency: 4,
          ritual: 2,
        },
      },
    ],
  },
  {
    id: 'lunch',
    order: 4,
    emoji: '🍲',
    title: '午餐时间',
    time: '13:20-14:30',
    location: '南塘街附近',
    mission: '用一顿饭决定今天是“本地派”还是“清淡续命派”。',
    accent: '#e58d4d',
    illustration: assetUrl('illustrations/04.jpg'),
    options: [
      {
        id: 'seafood-feast',
        title: '海鲜餐厅',
        price: 168,
        description: '来都来了，总得吃顿好的。',
        tags: ['高享受', '重量级消费', '鲜味拉满'],
        outcomes: [
          '会明显提升当天的满足感和记忆点。',
          '预算曲线会陡增，后面的仪式感项目要更谨慎。',
          '如果预算本来就宽松，这会成为整条线最值的高潮。',
        ],
        bestFor: '预算充足，愿意让一顿饭成为当天主角的人。',
        watchout: '一旦前面也选了高消费路线，这步之后很容易超支。',
        vector: {
          comfort: 5,
          local: 4,
          photo: 4,
          savings: 0,
          efficiency: 1,
          ritual: 4,
        },
      },
      {
        id: 'local-restaurant',
        title: '温州本地菜馆',
        price: 78,
        description: '跟着本地人走，一般不会踩坑。',
        recommended: true,
        tags: ['本地推荐', '均衡体验', '推荐路线'],
        outcomes: [
          '预算和体验都比较平衡，适合绝大多数人。',
          '既能吃到城市味道，也不会直接把晚上的选择锁死。',
          '是最像“商业上可复制推荐方案”的标准答案。',
        ],
        bestFor: '希望稳稳吃好，又保留后续决策自由度的人。',
        watchout: '如果你追求很强的惊喜感，它可能更稳而不是更炸。',
        vector: {
          comfort: 4,
          local: 5,
          photo: 3,
          savings: 3,
          efficiency: 3,
          ritual: 3,
        },
      },
      {
        id: 'street-noodle',
        title: '猪脏粉 + 瘦肉丸',
        price: 28,
        description: '旅行最重要的，是活着。',
        tags: ['快速续命', '低成本', '强本地符号'],
        outcomes: [
          '花费低，但在地特色很鲜明。',
          '会给印象南塘和夜景留出很舒服的预算空间。',
          '比起“正餐体验”，更像一记干脆利落的城市切面。',
        ],
        bestFor: '预算敏感，但又不想完全放弃温州特色的人。',
        watchout: '用餐环境和舒适度不如正规菜馆。',
        vector: {
          comfort: 2,
          local: 5,
          photo: 2,
          savings: 5,
          efficiency: 5,
          ritual: 1,
        },
      },
    ],
  },
  {
    id: 'nantang',
    order: 5,
    emoji: '🌉',
    title: '印象南塘',
    time: '15:00-17:00',
    location: '南塘街',
    mission: '把节奏放慢，把“城市温柔面”拍进脑子里。',
    accent: '#79a674',
    illustration: assetUrl('illustrations/05.jpg'),
    options: [
      {
        id: 'boat-ride',
        title: '游船体验',
        price: 80,
        description: '风吹过河面的时候，这座城市会慢下来。',
        tags: ['仪式感', '慢节奏', '拍照友好'],
        outcomes: [
          '下午的体验感会明显提升，更像一段正式章节。',
          '适合情侣、纪念日、或者想要镜头感的人。',
          '如果当天预算已经紧了，这一步会放大晚上压力。',
        ],
        bestFor: '很看重氛围、镜头和“值得发朋友圈”的人。',
        watchout: '它买的是氛围，不是效率。',
        vector: {
          comfort: 4,
          local: 2,
          photo: 5,
          savings: 1,
          efficiency: 1,
          ritual: 5,
        },
      },
      {
        id: 'riverside-walk',
        title: '沿河散步',
        price: 0,
        description: '最好的夜景，有时候不需要门票。',
        recommended: true,
        tags: ['零门票', '高氛围', '松弛感'],
        outcomes: [
          '保留南塘的风景和氛围，但不额外制造支出。',
          '会让路线更像一条真正的漫游副本，而不是打卡清单。',
          '非常适合作为预算紧张时的舒缓节点。',
        ],
        bestFor: '喜欢散步、拍街景、想让节奏自然一点的人。',
        watchout: '如果你特别想要“项目感”，会觉得偏轻。',
        vector: {
          comfort: 3,
          local: 4,
          photo: 4,
          savings: 5,
          efficiency: 4,
          ritual: 3,
        },
      },
    ],
  },
  {
    id: 'coffee',
    order: 6,
    emoji: '☕',
    title: '下午茶',
    time: '17:10-18:10',
    location: '咖啡街区',
    mission: '续命 + 整理照片，给晚上的体力条续一口。',
    accent: '#8a6a57',
    illustration: assetUrl('illustrations/06.jpg'),
    options: [
      {
        id: 'instagram-cafe',
        title: '网红咖啡馆',
        price: 42,
        description: '咖啡不一定最好喝，但照片一定很好看。',
        tags: ['拍照优先', '内容感', '轻社交'],
        outcomes: [
          '照片产出更稳定，适合把这一站做成内容素材。',
          '成本中等，不会像大项目那样重压预算。',
          '属于提升“商业展示感”的加分动作。',
        ],
        bestFor: '想给这趟路线补一些好看的传播内容的人。',
        watchout: '如果只在意续命，它并不是最省的答案。',
        vector: {
          comfort: 3,
          local: 2,
          photo: 5,
          savings: 2,
          efficiency: 3,
          ritual: 4,
        },
      },
      {
        id: 'chain-coffee',
        title: '连锁咖啡',
        price: 25,
        description: '稳定发挥，不给旅途增加风险。',
        recommended: true,
        tags: ['稳妥', '好找', '可预期'],
        outcomes: [
          '属于非常商业、非常可复制的中性解法。',
          '让节奏回到平衡，不会喧宾夺主。',
          '对后续夜景体验保留了一定弹性。',
        ],
        bestFor: '想要稳定、舒服、不踩雷的人。',
        watchout: '体验记忆点不强，更多是功能型补给。',
        vector: {
          comfort: 3,
          local: 1,
          photo: 2,
          savings: 4,
          efficiency: 5,
          ritual: 2,
        },
      },
      {
        id: 'store-americano',
        title: '便利店冰美式',
        price: 8,
        description: '续命成功，继续出发。',
        tags: ['极致省钱', '功能优先', '晚间蓄力'],
        outcomes: [
          '把预算压到最低，让晚上的选择更自由。',
          '适合对咖啡空间和打卡没有兴趣的人。',
          '路线观感会更硬核，也更像真正的“攻略型决策”。',
        ],
        bestFor: '想把有限预算优先投给主场景，而非补给环节的人。',
        watchout: '舒适度和停留感最低，更像补充燃料。',
        vector: {
          comfort: 1,
          local: 0,
          photo: 0,
          savings: 5,
          efficiency: 5,
          ritual: 0,
        },
      },
    ],
  },
  {
    id: 'night-view',
    order: 7,
    emoji: '🌃',
    title: '瓯江夜景',
    time: '19:00-21:00',
    location: '瓯江沿岸',
    mission: '用夜风收尾，把“今天很值”落到最后一幕。',
    accent: '#486cb0',
    illustration: assetUrl('illustrations/07.png'),
    options: [
      {
        id: 'night-cruise',
        title: '夜游游船',
        price: 120,
        description: '给今天画一个漂亮的句号。',
        tags: ['终章加成', '高仪式感', '付费收尾'],
        outcomes: [
          '会把整天的“值回票价”推到高点。',
          '适合把今天当成一个完整作品来收束。',
          '若预算已接近上限，这一步最容易把你送进超支区。',
        ],
        bestFor: '愿意为结尾买单，想要把这趟体验收得很漂亮的人。',
        watchout: '它非常看预算余量，不太适合临门冒险。',
        vector: {
          comfort: 4,
          local: 2,
          photo: 5,
          savings: 0,
          efficiency: 1,
          ritual: 5,
        },
      },
      {
        id: 'night-walk',
        title: '江边散步',
        price: 0,
        description: '什么都不做，看看江水也挺好。',
        recommended: true,
        tags: ['零成本收尾', '松弛感', '自然结局'],
        outcomes: [
          '这是一种很成熟的克制型结尾。',
          '让整条路线回到“漫游”的核心，而不是项目堆叠。',
          '尤其适合预算已紧或白天已经很饱满的时候。',
        ],
        bestFor: '想让这条路以平静、留白和真实感结束的人。',
        watchout: '如果你特别需要仪式感，收尾会略显轻。',
        vector: {
          comfort: 3,
          local: 4,
          photo: 3,
          savings: 5,
          efficiency: 4,
          ritual: 2,
        },
      },
    ],
  },
]

export const storageKey = 'wenzhou-travel-decision-state'
