import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Flag,
  Footprints,
  LockKeyhole,
  MapPinned,
  ReceiptText,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app-store'
import type { BudgetStatus, NodeCategory, RouteNode, RouteOption, TraitSummary } from '@/types/journey'

const budgetStatusMeta: Record<BudgetStatus, { label: string; tone: string; hint: string }> = {
  safe: {
    label: '预算安全',
    tone: 'border-leaf/25 bg-leaf/15 text-leaf',
    hint: '支出稳稳的，后面还有余裕可以任性一下~ 享受这段旅程吧。',
  },
  warning: {
    label: '预算预警',
    tone: 'border-orange/25 bg-orange/15 text-orange',
    hint: '快要靠近预算线了~ 下一张事件卡可以问问自己：什么才是这趟旅行最想要的？',
  },
  overspent: {
    label: '已经超支',
    tone: 'border-pink/25 bg-pink/15 text-pink',
    hint: '超预算了，但没关系~ 可以回头调整选择，也可以干脆接受这份小小的任性。',
  },
}

const categoryMeta: Record<NodeCategory, { label: string; tone: string }> = {
  transport: { label: '交通', tone: 'bg-sky/15 text-sky' },
  food: { label: '吃喝', tone: 'bg-orange/15 text-orange' },
  spot: { label: '打卡', tone: 'bg-pink/15 text-pink' },
  extra: { label: '额外事件', tone: 'bg-leaf/15 text-leaf' },
}

export default function JourneyPage() {
  const navigate = useNavigate()
  const scenario = useAppStore((state) => state.scenario)
  const selectNodeOption = useAppStore((state) => state.selectNodeOption)
  const resetScenarioProgress = useAppStore((state) => state.resetScenarioProgress)
  const setFlowStage = useAppStore((state) => state.setFlowStage)
  const [focusedNodeId, setFocusedNodeId] = useState<string>()

  const selectableNodes = useMemo(
    () => scenario.nodes.filter((node) => node.progress.status !== 'locked'),
    [scenario.nodes],
  )
  const currentNode = scenario.nodes.find((node) => node.progress.status === 'current')
  const fallbackFocusedNode = currentNode ?? selectableNodes.at(-1)
  const focusedNode = selectableNodes.find((node) => node.id === focusedNodeId) ?? fallbackFocusedNode
  const isComplete = scenario.settlement.completedNodes === scenario.settlement.totalNodes
  const budgetPercent = Math.min(scenario.budgetSnapshot.usageRate * 100, 100)

  useEffect(() => {
    if (!focusedNodeId && fallbackFocusedNode) {
      setFocusedNodeId(fallbackFocusedNode.id)
      return
    }

    if (focusedNodeId && !selectableNodes.some((node) => node.id === focusedNodeId) && fallbackFocusedNode) {
      setFocusedNodeId(fallbackFocusedNode.id)
    }
  }, [fallbackFocusedNode, focusedNodeId, selectableNodes])

  const handleSelectOption = (node: RouteNode, option: RouteOption) => {
    const nodeIndex = scenario.nodes.findIndex((item) => item.id === node.id)
    const isProgressingCurrentNode = node.progress.status === 'current'
    const willFinishJourney = isProgressingCurrentNode && scenario.settlement.completedNodes === scenario.settlement.totalNodes - 1

    selectNodeOption(node.id, option.id)

    if (willFinishJourney) {
      setFlowStage('result')
      navigate('/result')
      return
    }

    if (isProgressingCurrentNode) {
      const nextNode = scenario.nodes[nodeIndex + 1]
      if (nextNode) {
        setFocusedNodeId(nextNode.id)
      }
      return
    }

    setFocusedNodeId(node.id)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border-2 border-ink/10 bg-white/90 p-6 shadow-sketch">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex rounded-full border border-leaf/30 bg-leaf/15 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-leaf">
              彩铅桌游副本进行中
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">Journey Board</p>
              <h1 className="mt-2 text-3xl font-black md:text-4xl">{scenario.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70 md:text-base">{scenario.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm font-semibold text-ink/65">
              已完成 {scenario.settlement.completedNodes}/{scenario.settlement.totalNodes} 节点
            </span>
            <span
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${budgetStatusMeta[scenario.budgetSnapshot.status].tone}`}
            >
              {budgetStatusMeta[scenario.budgetSnapshot.status].label}
            </span>
            {scenario.matchMeta.matchedKeywords.slice(0, 2).map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-sky/25 bg-sky/10 px-4 py-2 text-sm font-semibold text-sky"
              >
                命中 {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="总预算" value={`${scenario.budget}`} icon={<Coins size={18} />} tone="leaf" />
        <InfoCard label="已消费" value={`${scenario.spent}`} icon={<Sparkles size={18} />} tone="orange" />
        <InfoCard label="剩余预算" value={`${scenario.budgetSnapshot.remaining}`} icon={<Footprints size={18} />} tone="sky" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <aside className="space-y-6">
          <section className="rounded-[2rem] border-2 border-ink/10 bg-white/90 p-6 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">预算栏</p>
                <h2 className="mt-2 text-2xl font-black">今天的钱包血条</h2>
              </div>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${budgetStatusMeta[scenario.budgetSnapshot.status].tone}`}>
                {budgetStatusMeta[scenario.budgetSnapshot.status].label}
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-full bg-paper">
              <div
                className={`h-4 rounded-full transition-all ${
                  scenario.budgetSnapshot.status === 'safe'
                    ? 'bg-gradient-to-r from-leaf to-sky'
                    : scenario.budgetSnapshot.status === 'warning'
                      ? 'bg-gradient-to-r from-orange to-pink'
                      : 'bg-gradient-to-r from-pink to-orange'
                }`}
                style={{ width: `${Math.max(budgetPercent, 8)}%` }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <BudgetMiniStat label="预算池" value={`¥${scenario.budgetSnapshot.total}`} />
              <BudgetMiniStat label="已消耗" value={`¥${scenario.budgetSnapshot.spent}`} />
              <BudgetMiniStat label="可回旋" value={`¥${scenario.budgetSnapshot.remaining}`} />
            </div>

            <p className="mt-4 text-sm leading-6 text-ink/65">{budgetStatusMeta[scenario.budgetSnapshot.status].hint}</p>
          </section>

          <section className="rounded-[2rem] border-2 border-ink/10 bg-paper/80 p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky/15 p-3 text-sky">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">属性面板</p>
                <h2 className="text-2xl font-black">你的旅行人格</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {scenario.traitSummary.map((trait) => (
                <TraitCard key={trait.key} trait={trait} isDominant={trait.key === scenario.settlement.dominantTrait} />
              ))}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-ink/10 bg-white/80 p-4">
              <p className="text-sm font-semibold text-ink/55">当前主导人格</p>
              <p className="mt-1 text-lg font-black text-ink">{scenario.settlement.personaLabel}</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                每次改选事件卡，预算和属性都会同步重算，结算页会直接读取当前这份副本状态。
              </p>
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[2rem] border-2 border-ink/10 bg-white/90 p-6 shadow-sketch">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">路线节点</p>
                <h2 className="mt-2 text-2xl font-black">像桌游一样推进路线</h2>
              </div>
              <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink/60">
                点击已解锁节点可回看并改选
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {scenario.nodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  disabled={node.progress.status === 'locked'}
                  onClick={() => setFocusedNodeId(node.id)}
                  className={`flex w-full items-start gap-4 rounded-[1.6rem] border-2 p-4 text-left transition ${
                    node.progress.status === 'locked'
                      ? 'cursor-not-allowed border-ink/10 bg-paper/60 opacity-70'
                      : focusedNode?.id === node.id
                        ? 'border-sky/35 bg-sky/10 shadow-soft'
                        : 'border-ink/10 bg-paper/80 hover:-translate-y-0.5 hover:border-leaf/30'
                  }`}
                >
                  <div
                    className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] border-2 text-sm font-black ${
                      node.progress.status === 'completed'
                        ? 'border-leaf/20 bg-leaf/15 text-leaf'
                        : node.progress.status === 'current'
                          ? 'border-sky/25 bg-sky/15 text-sky'
                          : 'border-ink/10 bg-white text-ink/45'
                    }`}
                  >
                    {node.progress.order}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryMeta[node.category].tone}`}>
                        {categoryMeta[node.category].label}
                      </span>
                      <NodeStatusBadge node={node} />
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-ink">{node.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{node.event.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {node.progress.selectedOptionId ? (
                        <SelectedOptionPill node={node} />
                      ) : (
                        <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink/55">
                          等待选择
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border-2 border-ink/10 bg-white/90 p-6 shadow-sketch">
            {focusedNode ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryMeta[focusedNode.category].tone}`}>
                        {categoryMeta[focusedNode.category].label}
                      </span>
                      <NodeStatusBadge node={focusedNode} />
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">事件卡</p>
                    <h2 className="mt-2 text-2xl font-black">{focusedNode.event.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-ink/70 md:text-base">{focusedNode.event.description}</p>
                  </div>

                  <div className="rounded-[1.5rem] border border-ink/10 bg-paper/80 p-4 text-sm text-ink/65">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      <ReceiptText size={16} />
                      当前聚焦节点
                    </div>
                    <p className="mt-2 text-lg font-black text-ink">{focusedNode.title}</p>
                    <p className="mt-2 leading-6">
                      {focusedNode.progress.status === 'current'
                        ? '选完这里就会自动推进到下一格。'
                        : '这是已完成节点，改选后预算和人格会立即刷新。'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {focusedNode.event.options.map((option) => {
                    const isSelected = focusedNode.progress.selectedOptionId === option.id

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(focusedNode, option)}
                        className={`rounded-[1.6rem] border-2 p-5 text-left transition hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-leaf/35 bg-leaf/10 shadow-soft'
                            : 'border-ink/10 bg-paper/80 hover:border-sky/30'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-leaf/15 px-3 py-1 text-xs font-semibold text-leaf">
                                  <CheckCircle2 size={14} />
                                  当前选择
                                </span>
                              ) : null}
                              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink/55">
                                预算变化 ¥{option.cost}
                              </span>
                            </div>
                            <h3 className="mt-3 text-lg font-bold text-ink">{option.label}</h3>
                            <p className="mt-2 text-sm leading-6 text-ink/70">{option.effectText}</p>
                          </div>

                          <span className="rounded-[1.2rem] border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
                            {isSelected ? '已采用' : '选择此路线'}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {renderTraitDelta(option)}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-paper/70 p-6 text-sm leading-7 text-ink/65">
                当前没有可编辑节点，可以点击“重开当前副本”重新开始。
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border-2 border-ink/10 bg-paper/80 p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">终点收口</p>
                <h2 className="mt-2 text-2xl font-black">走完路线后进入结算</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetScenarioProgress()
                  setFocusedNodeId(undefined)
                }}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
              >
                <RefreshCcw size={16} />
                重开当前副本
              </button>
            </div>

            {isComplete ? (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-leaf/25 bg-white/85 p-5">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-leaf/15 px-3 py-1 text-xs font-semibold text-leaf">
                    <Flag size={14} />
                    已通关全部节点
                  </div>
                  <p className="mt-3 text-xl font-black text-ink">{scenario.settlement.personaLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{scenario.settlement.summary}</p>
                </div>
                <Link
                  to="/result"
                  onClick={() => setFlowStage('result')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-leaf px-5 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-leaf/90"
                >
                  查看结算页
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.75rem] border border-ink/10 bg-white/85 p-5">
                <p className="text-lg font-bold text-ink">还有 {scenario.settlement.totalNodes - scenario.settlement.completedNodes} 个节点待推进</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">
                  把当前路线全部走完后，会自动进入结算页；也可以先回看已完成节点，调整消费风格再继续。
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

type InfoCardProps = {
  label: string
  value: string
  icon: ReactNode
  tone: 'leaf' | 'orange' | 'sky'
}

function InfoCard({ label, value, icon, tone }: InfoCardProps) {
  const toneClass = {
    leaf: 'bg-leaf/15 text-leaf',
    orange: 'bg-orange/15 text-orange',
    sky: 'bg-sky/15 text-sky',
  }

  return (
    <div className="rounded-[1.75rem] border-2 border-ink/10 bg-white/85 p-5 shadow-soft">
      <div className={`inline-flex rounded-2xl p-3 ${toneClass[tone]}`}>{icon}</div>
      <p className="mt-4 text-sm text-ink/60">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  )
}

type BudgetMiniStatProps = {
  label: string
  value: string
}

function BudgetMiniStat({ label, value }: BudgetMiniStatProps) {
  return (
    <div className="rounded-[1.3rem] border border-ink/10 bg-white/85 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">{label}</p>
      <p className="mt-2 text-xl font-black text-ink">{value}</p>
    </div>
  )
}

type TraitCardProps = {
  trait: TraitSummary
  isDominant: boolean
}

function TraitCard({ trait, isDominant }: TraitCardProps) {
  return (
    <div className={`rounded-[1.5rem] border p-4 ${isDominant ? 'border-leaf/25 bg-white' : 'border-ink/10 bg-white/80'}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">{trait.label}</p>
          <p className="mt-1 text-xs leading-5 text-ink/55">{trait.descriptor}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDominant ? 'bg-leaf/15 text-leaf' : 'bg-paper text-ink/60'}`}>
          {trait.score}
        </span>
      </div>
      <div className="mt-3 overflow-hidden rounded-full bg-paper">
        <div
          className={`h-2 rounded-full ${isDominant ? 'bg-gradient-to-r from-leaf to-sky' : 'bg-gradient-to-r from-sky to-orange'}`}
          style={{ width: `${Math.max(Math.min(trait.score, 100), 12)}%` }}
        />
      </div>
    </div>
  )
}

type NodeStatusBadgeProps = {
  node: RouteNode
}

function NodeStatusBadge({ node }: NodeStatusBadgeProps) {
  if (node.progress.status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-leaf/15 px-3 py-1 text-xs font-semibold text-leaf">
        <CheckCircle2 size={14} />
        已完成
      </span>
    )
  }

  if (node.progress.status === 'current') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky/15 px-3 py-1 text-xs font-semibold text-sky">
        <MapPinned size={14} />
        当前推进中
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/45">
      <LockKeyhole size={14} />
      待解锁
    </span>
  )
}

type SelectedOptionPillProps = {
  node: RouteNode
}

function SelectedOptionPill({ node }: SelectedOptionPillProps) {
  const selectedOption = node.event.options.find((option) => option.id === node.progress.selectedOptionId)

  if (!selectedOption) {
    return null
  }

  return (
    <>
      <span className="rounded-full border border-leaf/20 bg-leaf/10 px-3 py-1.5 text-xs font-semibold text-leaf">
        已选 {selectedOption.label}
      </span>
      <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink/55">
        +¥{selectedOption.cost}
      </span>
    </>
  )
}

function renderTraitDelta(option: RouteOption) {
  const entries = Object.entries(option.traitDelta ?? {})

  if (entries.length === 0) {
    return [
      <span
        key={`${option.id}-plain`}
        className="rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink/55"
      >
        纯预算变化
      </span>,
    ]
  }

  return entries.map(([key, delta]) => {
    const value = Number(delta)
    const label = key === 'budgeter' ? '预算掌控' : key === 'speedrunner' ? '速通执行' : '体验精致'

    return (
      <span
        key={`${option.id}-${key}`}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
          value >= 0 ? 'bg-leaf/15 text-leaf' : 'bg-pink/15 text-pink'
        }`}
      >
        {label} {value >= 0 ? `+${value}` : value}
      </span>
    )
  })
}
