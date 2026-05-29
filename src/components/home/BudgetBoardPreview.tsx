import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Coins, Dice5, Luggage, Plane } from 'lucide-react'

type Tone = 'leaf' | 'sky' | 'orange' | 'pink'

const stopCards: Array<{
  title: string
  budget: string
  detail: string
  icon: LucideIcon
  tone: Tone
}> = [
  {
    title: '交通起步格',
    budget: '¥280-420',
    detail: '先看大交通和落地通勤，判断这趟是否超出心理价位。',
    icon: Plane,
    tone: 'sky',
  },
  {
    title: '住宿补给站',
    budget: '¥320-560',
    detail: '把住几晚、住哪片区和节假日波动提前摊开来看。',
    icon: Luggage,
    tone: 'leaf',
  },
  {
    title: '吃喝支线格',
    budget: '¥150-260',
    detail: '把想吃的店、路边补给和临时加餐放进预算缓冲。',
    icon: Coins,
    tone: 'orange',
  },
  {
    title: '门票与随机事件',
    budget: '¥120-300',
    detail: '把排队、改计划和临时打车这类变量做成预留空间。',
    icon: Dice5,
    tone: 'pink',
  },
]

const toneClasses: Record<Tone, string> = {
  leaf: 'bg-leaf/15 text-leaf',
  sky: 'bg-sky/15 text-sky',
  orange: 'bg-orange/15 text-orange',
  pink: 'bg-pink/15 text-pink',
}

const summaryBadges = [
  '飞行棋路径预览',
  '彩铅手绘桌游风',
  '出发前先看预算',
]

export default function BudgetBoardPreview() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-ink/10 bg-white/90 p-6 shadow-sketch">
      <div className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-pink/15 blur-2xl" />
      <div className="pointer-events-none absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-sky/15 blur-2xl" />
      <FloatingBalloon />
      <FloatingToken
        className="-left-3 top-24"
        tone="sky"
        icon={Plane}
        rotate={-10}
        animation={{ y: [0, -8, 0], x: [0, 3, 0] }}
      />
      <FloatingToken
        className="right-6 top-8"
        tone="orange"
        icon={Dice5}
        rotate={8}
        animation={{ y: [0, 6, 0], rotate: [8, 2, 8] }}
      />
      <FloatingToken
        className="-right-4 bottom-24"
        tone="leaf"
        icon={Luggage}
        rotate={-8}
        animation={{ y: [0, -7, 0], rotate: [-8, -2, -8] }}
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange">Budget Board</p>
            <h2 className="text-3xl font-black leading-tight text-ink md:text-[2rem]">飞行棋一样先走一遍预算路线</h2>
            <p className="max-w-xl text-sm text-ink/70">
              首页先把预算大头、随机花费和消费节奏画出来，帮助用户在出发前判断这趟旅行值不值得立刻上车。
            </p>
          </div>
          <div className="rounded-[1.5rem] border-2 border-ink/10 bg-paper/90 px-4 py-3 text-right shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">示例预算</p>
            <p className="mt-1 text-3xl font-black text-ink">¥980 - ¥1,540</p>
            <p className="mt-1 text-sm text-ink/60">含基础交通、住宿、吃喝和弹性支出</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {summaryBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink/65"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="relative mt-6 rounded-[2rem] border-2 border-ink/10 bg-paper/75 p-4 md:p-5">
          <div className="absolute bottom-8 left-6 top-8 w-px border-l-2 border-dashed border-ink/15" />
          <div className="space-y-4">
            {stopCards.map(({ title, budget, detail, icon: Icon, tone }, index) => (
              <motion.article
                key={title}
                initial={{ x: index % 2 === 0 ? -18 : 18, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.08 }}
                className={`relative flex items-start gap-4 ${index % 2 === 1 ? 'md:ml-8' : 'md:mr-8'}`}
              >
                <div
                  className={`relative z-10 mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] border-2 border-white bg-white shadow-soft ${toneClasses[tone]}`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 rounded-[1.5rem] border-2 border-ink/10 bg-white/90 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">预算节点 {index + 1}</p>
                      <h3 className="mt-1 text-lg font-bold text-ink">{title}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{budget}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/70">{detail}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <PreviewCard title="行李箱" detail="把必花项先装箱，避免出发后才发现预算缺口。" />
          <PreviewCard title="骰子格" detail="把随机消费作为弹性缓冲，而不是事后补救。" />
          <PreviewCard title="终点牌" detail="到达前就能知道整趟旅行的大致预算上限。" />
        </div>
      </div>
    </div>
  )
}

type FloatingTokenProps = {
  className: string
  tone: Tone
  icon: LucideIcon
  rotate: number
  animation: {
    x?: number[]
    y?: number[]
    rotate?: number[]
  }
}

function FloatingToken({ className, tone, icon: Icon, rotate, animation }: FloatingTokenProps) {
  return (
    <motion.div
      animate={animation}
      transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      className={`pointer-events-none absolute z-10 rounded-[1.4rem] border-2 border-white bg-white/90 p-3 shadow-soft ${className}`}
      style={{ rotate: `${rotate}deg` }}
    >
      <div className={`rounded-[1rem] p-2 ${toneClasses[tone]}`}>
        <Icon size={18} />
      </div>
    </motion.div>
  )
}

function FloatingBalloon() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      className="pointer-events-none absolute right-24 top-10 z-10 flex flex-col items-center"
    >
      <div className="relative h-14 w-14 rounded-full border-2 border-white bg-pink/80 shadow-soft">
        <div className="absolute left-3 top-2 h-10 w-10 rounded-full bg-white/30" />
      </div>
      <div className="h-6 w-px bg-ink/20" />
      <div className="h-4 w-5 rounded-md border-2 border-white bg-orange/75 shadow-soft" />
    </motion.div>
  )
}

type PreviewCardProps = {
  title: string
  detail: string
}

function PreviewCard({ title, detail }: PreviewCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-ink/10 bg-white/85 p-4 shadow-soft">
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink/65">{detail}</p>
    </div>
  )
}
