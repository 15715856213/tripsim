import { useMemo, useState, type ReactNode } from 'react'
import {
  Award,
  Coins,
  Compass,
  Flag,
  PiggyBank,
  RefreshCcw,
  Route,
  Share2,
  Sparkles,
  Ticket,
  TrainFront,
  UtensilsCrossed,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app-store'
import type { NodeCategory } from '@/types/journey'

const budgetToneClass = {
  safe: 'border-leaf/25 bg-leaf/15 text-leaf',
  warning: 'border-orange/25 bg-orange/15 text-orange',
  overspent: 'border-pink/25 bg-pink/15 text-pink',
} as const

const budgetLabel = {
  safe: '预算安全',
  warning: '预算预警',
  overspent: '已经超支',
} as const

const spendingCategoryMeta: Record<
  NodeCategory,
  {
    label: string
    shortLabel: string
    tone: string
    icon: ReactNode
  }
> = {
  food: {
    label: '餐饮',
    shortLabel: '吃喝补给',
    tone: 'border-orange/25 bg-orange/10 text-orange',
    icon: <UtensilsCrossed size={16} />,
  },
  transport: {
    label: '交通',
    shortLabel: '移动接驳',
    tone: 'border-sky/25 bg-sky/10 text-sky',
    icon: <TrainFront size={16} />,
  },
  spot: {
    label: '门票',
    shortLabel: '景点打卡',
    tone: 'border-leaf/25 bg-leaf/10 text-leaf',
    icon: <Ticket size={16} />,
  },
  extra: {
    label: '其他',
    shortLabel: '加购体验',
    tone: 'border-pink/25 bg-pink/10 text-pink',
    icon: <Sparkles size={16} />,
  },
}

const spendingCategoryOrder: NodeCategory[] = ['food', 'transport', 'spot', 'extra']

export default function ResultPage() {
  const navigate = useNavigate()
  const scenario = useAppStore((state) => state.scenario)
  const draftLink = useAppStore((state) => state.draftLink)
  const resetScenarioProgress = useAppStore((state) => state.resetScenarioProgress)
  const settlement = scenario.settlement
  const isComplete = settlement.completedNodes === settlement.totalNodes
  const [shareFeedback, setShareFeedback] = useState<string>('')

  const spendingBreakdown = useMemo(() => {
    const totals: Record<NodeCategory, number> = {
      food: 0,
      transport: 0,
      spot: 0,
      extra: 0,
    }

    scenario.nodes.forEach((node) => {
      const selectedOption = node.event.options.find((option) => option.id === node.progress.selectedOptionId)

      totals[node.category] += selectedOption?.cost ?? 0
    })

    return spendingCategoryOrder.map((category) => {
      const amount = totals[category]
      const share = settlement.totalSpent === 0 ? 0 : Math.round((amount / settlement.totalSpent) * 100)

      return {
        category,
        amount,
        share,
        ...spendingCategoryMeta[category],
      }
    })
  }, [scenario.nodes, settlement.totalSpent])

  const budgetUsagePercent = Math.round(scenario.budgetSnapshot.usageRate * 100)
  const budgetProgressWidth = Math.min(Math.max(budgetUsagePercent, 6), 100)
  const budgetGap = Math.abs(settlement.remainingBudget)
  const budgetDifferenceLabel =
    settlement.budgetStatus === 'overspent' ? `超出 ¥${budgetGap}` : `结余 ¥${settlement.remainingBudget}`
  const budgetNarrative = getBudgetNarrative(settlement.budgetStatus, budgetGap, scenario.budget)
  const shareText = [
    `我刚完成了 ${settlement.title}`,
    `总消费：${formatCurrency(settlement.totalSpent)} / 预算上限：${formatCurrency(scenario.budget)}`,
    `预算状态：${budgetLabel[settlement.budgetStatus]}${settlement.budgetStatus === 'overspent' ? `，超出 ${formatCurrency(budgetGap)}` : ''}`,
    `消费拆分：${spendingBreakdown.map((item) => `${item.label} ${formatCurrency(item.amount)}`).join(' / ')}`,
    draftLink ? `同款旅行来源：${draftLink}` : '这是我在旅行模拟器里跑出的当前副本结算。',
  ].join('\n')

  const handleReplay = () => {
    resetScenarioProgress()
    navigate('/journey')
  }

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: settlement.title,
          text: shareText,
        })
        setShareFeedback('已调起系统分享')
        return
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        setShareFeedback('副本摘要已复制，可直接发给朋友')
        return
      }

      setShareFeedback('当前环境不支持系统分享或剪贴板复制')
    } catch {
      setShareFeedback('分享未完成，你可以稍后再试')
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border-2 border-ink/10 bg-white/90 p-6 shadow-sketch">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange">Settlement Board</p>
              <h1 className="mt-2 text-3xl font-black md:text-4xl">{settlement.title}</h1>
              <p className="mt-3 text-sm leading-7 text-ink/70 md:text-base">{settlement.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${budgetToneClass[settlement.budgetStatus]}`}>
                {budgetLabel[settlement.budgetStatus]}
              </span>
              <span className="rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm font-semibold text-ink/60">
                完成 {settlement.completedNodes}/{settlement.totalNodes}
              </span>
            </div>
          </div>

          {!isComplete ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.6rem] border border-orange/25 bg-orange/10 p-4">
              <div>
                <p className="text-lg font-bold text-ink">副本还没完全通关</p>
                <p className="mt-1 text-sm text-ink/65">你是从导航直接进入了结算页，当前展示的是实时阶段性结果。</p>
              </div>
              <Link
                to="/journey"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange/90"
              >
                返回继续副本
              </Link>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="总消费"
              value={formatCurrency(settlement.totalSpent)}
              hint={`已吃掉预算 ${budgetUsagePercent}%`}
              icon={<PiggyBank size={18} />}
              tone="orange"
            />
            <SummaryCard
              label={settlement.budgetStatus === 'overspent' ? '超预算部分' : '预算结余'}
              value={budgetDifferenceLabel}
              hint={settlement.budgetStatus === 'overspent' ? '需要回看高消费节点' : `预算上限 ${formatCurrency(scenario.budget)}`}
              icon={<Coins size={18} />}
              tone={settlement.budgetStatus === 'overspent' ? 'pink' : 'leaf'}
            />
            <SummaryCard label="旅行人格" value={settlement.personaLabel} icon={<Award size={18} />} tone="sky" />
            <SummaryCard label="主导属性" value={findTraitLabel(settlement.dominantTrait)} icon={<Compass size={18} />} tone="pink" />
          </div>

          <div className="mt-5 rounded-[1.75rem] border border-ink/10 bg-paper/80 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">Budget Watch</p>
                <h2 className="mt-2 text-xl font-black text-ink">
                  {settlement.budgetStatus === 'overspent' ? '这趟已经超预算' : '总消费还在预算线内'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink/65">{budgetNarrative}</p>
              </div>
              <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${budgetToneClass[settlement.budgetStatus]}`}>
                {settlement.budgetStatus === 'overspent' ? `超出 ${formatCurrency(budgetGap)}` : `剩余 ${formatCurrency(settlement.remainingBudget)}`}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <BudgetMetric label="预算上限" value={formatCurrency(scenario.budget)} />
              <BudgetMetric label="当前消费" value={formatCurrency(settlement.totalSpent)} />
              <BudgetMetric
                label={settlement.budgetStatus === 'overspent' ? '超出额度' : '剩余额度'}
                value={formatCurrency(budgetGap)}
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-ink/60">
                <span>预算进度</span>
                <span>{budgetUsagePercent}%</span>
              </div>
              <div className="mt-2 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-3 rounded-full transition-all ${
                    settlement.budgetStatus === 'overspent'
                      ? 'bg-gradient-to-r from-pink to-orange'
                      : settlement.budgetStatus === 'warning'
                        ? 'bg-gradient-to-r from-orange to-pink'
                        : 'bg-gradient-to-r from-leaf to-sky'
                  }`}
                  style={{ width: `${budgetProgressWidth}%` }}
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-ink/50">
                {settlement.budgetStatus === 'overspent'
                  ? '进度条已封顶显示，超出的部分会单独标记。'
                  : budgetUsagePercent >= 80
                    ? '已经接近预算上限，后续节点建议优先控花费。'
                    : '目前消费节奏平稳，还有继续加点体验的空间。'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border-2 border-ink/10 bg-paper p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-leaf/15 p-3 text-leaf">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">成就贴纸</p>
              <h2 className="text-2xl font-black">这趟旅程留下什么</h2>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {settlement.badges.map((badge) => (
              <span
                key={badge.id}
                className="rounded-full border border-leaf/30 bg-white px-4 py-2 text-sm font-semibold text-leaf"
              >
                {badge.label}
              </span>
            ))}
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-ink/10 bg-white/85 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">属性回顾</p>
            <div className="mt-4 space-y-3">
              {scenario.traitSummary.map((trait) => (
                <div key={trait.key}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-ink">{trait.label}</p>
                    <span className="text-sm font-semibold text-ink/60">{trait.score}</span>
                  </div>
                  <div className="mt-2 overflow-hidden rounded-full bg-paper">
                    <div
                      className={`h-2 rounded-full ${
                        trait.key === settlement.dominantTrait
                          ? 'bg-gradient-to-r from-leaf to-sky'
                          : 'bg-gradient-to-r from-sky to-orange'
                      }`}
                      style={{ width: `${Math.max(Math.min(trait.score, 100), 12)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink/10 bg-white px-5 py-3 font-semibold text-ink transition hover:-translate-y-0.5"
            >
              <Share2 size={16} />
              分享我的副本
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center gap-2 rounded-2xl bg-leaf px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-leaf/90"
            >
              <RefreshCcw size={16} />
              再玩一次
            </button>
            <Link
              to="/"
              className="rounded-2xl border-2 border-ink/10 bg-white px-5 py-3 font-semibold text-ink transition hover:-translate-y-0.5"
            >
              返回首页
            </Link>
          </div>
          {shareFeedback ? <p className="mt-3 text-sm text-ink/55">{shareFeedback}</p> : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border-2 border-ink/10 bg-white/90 p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky/15 p-3 text-sky">
              <Flag size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">副本结论</p>
              <h2 className="text-2xl font-black">这趟预算副本怎么花的</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {spendingBreakdown.map((item) => (
              <article key={item.category} className="rounded-[1.5rem] border border-ink/10 bg-paper/75 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{item.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/40">{item.shortLabel}</p>
                  </div>
                  <span className={`inline-flex rounded-2xl border px-3 py-2 ${item.tone}`}>{item.icon}</span>
                </div>
                <p className="mt-4 text-2xl font-black text-ink">{formatCurrency(item.amount)}</p>
                <div className="mt-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-sky to-orange"
                    style={{ width: `${Math.max(item.share, item.amount > 0 ? 12 : 0)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-ink/55">{settlement.totalSpent === 0 ? '当前还没有发生消费' : `约占总消费 ${item.share}%`}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            <ConclusionCard
              title="预算表现"
              detail={
                settlement.budgetStatus === 'overspent'
                  ? `${budgetLabel[settlement.budgetStatus]}，当前比原预算多花了 ${formatCurrency(budgetGap)}。`
                  : `${budgetLabel[settlement.budgetStatus]}，当前还留有 ${formatCurrency(settlement.remainingBudget)} 可支配预算。`
              }
            />
            <ConclusionCard
              title="消费主力"
              detail={`${getPrimarySpendingLabel(spendingBreakdown)}是这趟旅程最主要的花费方向，说明你的预算主要投在这里。`}
            />
            <ConclusionCard
              title="旅程人设"
              detail={`你的主要风格是“${settlement.personaLabel}”，最高属性为 ${findTraitLabel(settlement.dominantTrait)}。`}
            />
            <ConclusionCard
              title="通关进度"
              detail={`总共完成 ${settlement.completedNodes}/${settlement.totalNodes} 个路线节点${isComplete ? '，当前结算为完整通关结果。' : '，当前展示的是阶段性结果。'}`}
            />
          </div>
        </section>

        <section className="rounded-[2rem] border-2 border-ink/10 bg-paper/85 p-6 shadow-sketch">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange/15 p-3 text-orange">
              <Route size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">路线回放</p>
              <h2 className="text-2xl font-black">每一格最终怎么选</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {scenario.nodes.map((node) => {
              const selectedOption = node.event.options.find((option) => option.id === node.progress.selectedOptionId)

              return (
                <article key={node.id} className="rounded-[1.6rem] border border-ink/10 bg-white/85 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                        节点 {node.progress.order} · {spendingCategoryMeta[node.category].label}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-ink">{node.title}</h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedOption ? 'bg-leaf/15 text-leaf' : 'bg-paper text-ink/55'
                      }`}
                    >
                      {selectedOption ? '已定稿' : '未完成'}
                    </span>
                  </div>

                  <div className="mt-3 rounded-[1.3rem] bg-paper/80 p-4 text-sm leading-6 text-ink/65">
                    {selectedOption ? (
                      <>
                        <p className="font-semibold text-ink">{selectedOption.label}</p>
                        <p className="mt-1">{selectedOption.effectText}</p>
                        <p className="mt-2 font-semibold text-ink/80">
                          预算记账：{formatCurrency(selectedOption.cost)} · 计入{spendingCategoryMeta[node.category].label}
                        </p>
                      </>
                    ) : (
                      <p>这个节点还没有完成选择，回到副本页后可以继续推进。</p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </section>
  )
}

type SummaryCardProps = {
  label: string
  value: string
  hint?: string
  icon: ReactNode
  tone: 'leaf' | 'orange' | 'sky' | 'pink'
}

function SummaryCard({ label, value, hint, icon, tone }: SummaryCardProps) {
  const toneClass = {
    leaf: 'bg-leaf/15 text-leaf',
    orange: 'bg-orange/15 text-orange',
    sky: 'bg-sky/15 text-sky',
    pink: 'bg-pink/15 text-pink',
  }

  return (
    <div className="rounded-[1.75rem] bg-paper p-5">
      <div className={`inline-flex rounded-2xl p-3 ${toneClass[tone]}`}>{icon}</div>
      <p className="mt-4 text-sm text-ink/60">{label}</p>
      <p className="text-2xl font-black">{value}</p>
      {hint ? <p className="mt-2 text-sm text-ink/50">{hint}</p> : null}
    </div>
  )
}

type BudgetMetricProps = {
  label: string
  value: string
}

function BudgetMetric({ label, value }: BudgetMetricProps) {
  return (
    <div className="rounded-[1.3rem] bg-white/90 p-4">
      <p className="text-sm text-ink/55">{label}</p>
      <p className="mt-2 text-lg font-black text-ink">{value}</p>
    </div>
  )
}

type ConclusionCardProps = {
  title: string
  detail: string
}

function ConclusionCard({ title, detail }: ConclusionCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-ink/10 bg-paper/80 p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink/65">{detail}</p>
    </div>
  )
}

function findTraitLabel(trait: string) {
  if (trait === 'budgeter') {
    return '预算掌控'
  }

  if (trait === 'speedrunner') {
    return '速通执行'
  }

  return '体验精致'
}

function getBudgetNarrative(status: keyof typeof budgetLabel, budgetGap: number, totalBudget: number) {
  if (status === 'overspent') {
    return `当前花费已经突破原始预算 ${formatCurrency(totalBudget)}，建议优先回看交通、门票或加购节点。`
  }

  if (status === 'warning') {
    return `消费已经进入预警线，距离预算上限只剩 ${formatCurrency(budgetGap)} 的腾挪空间。`
  }

  return `你还没有碰到预算红线，距离预算上限 ${formatCurrency(totalBudget)} 仍保留了比较充足的回旋余地。`
}

function getPrimarySpendingLabel(
  breakdown: Array<{
    label: string
    amount: number
  }>,
) {
  const topCategory = breakdown.reduce((current, item) => (item.amount > current.amount ? item : current), breakdown[0])

  if (!topCategory || topCategory.amount === 0) {
    return '当前没有明显的消费主力项'
  }

  return `${topCategory.label}${formatCurrency(topCategory.amount)}`
}

function formatCurrency(value: number) {
  return `¥${value}`
}
