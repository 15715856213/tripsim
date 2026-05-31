import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/wenzhou-sim.css'
import { scriptNodes } from '@/data/travelScript'
import {
  calculateSpent,
  getBudgetState,
  getOptionById,
  getRemainingBudget,
  getStepInsight,
  type SelectionMap,
} from '@/lib/analysis'
import { useAppStore } from '@/store/app-store'

const DESIGN_WIDTH = 1365
const DESIGN_HEIGHT = 768
const BUDGET_PRESETS = [220, 300, 420, 520]

const optionIcons: Record<string, string> = {
  'hotel-breakfast': '🍱',
  'rice-and-soy': '🍚',
  'convenience-combo': '🥪',
  'island-ticket': '🏝️',
  'island-photo-only': '📷',
  'souvenir-shopping': '🎁',
  'window-shopping': '🛍️',
  'seafood-feast': '🦀',
  'local-restaurant': '🥘',
  'street-noodle': '🍜',
  'boat-ride': '🚤',
  'riverside-walk': '🌉',
  'instagram-cafe': '📸',
  'chain-coffee': '☕',
  'store-americano': '🥤',
  'night-cruise': '🚢',
  'night-walk': '🌙',
}

const formatMoney = (amount: number) => `${amount}`

const fitStage = () => {
  if (typeof window === 'undefined') {
    return 'translate(-50%, -50%) scale(1)'
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const isPortrait = vh > vw
  const shouldRotate = isPortrait && Math.min(vw, vh) < 900

  let scale = shouldRotate
    ? Math.min(vw / DESIGN_HEIGHT, vh / DESIGN_WIDTH)
    : Math.min(vw / DESIGN_WIDTH, vh / DESIGN_HEIGHT)

  scale = Math.max(0.12, scale * 0.985)

  return `translate(-50%, -50%) rotate(${shouldRotate ? 90 : 0}deg) scale(${scale})`
}

function WenzhouSimPage() {
  const navigate = useNavigate()
  const storedBudget = useAppStore((state) => state.wenzhouSimBudget)
  const setFlowStage = useAppStore((state) => state.setFlowStage)
  const saveWenzhouSimSnapshot = useAppStore((state) => state.saveWenzhouSimSnapshot)
  const saveWenzhouSimSelections = useAppStore((state) => state.saveWenzhouSimSelections)
  const [budget, setBudget] = useState(storedBudget)
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<SelectionMap>({})
  const [transform, setTransform] = useState(fitStage)
  const [showBudgetPicker, setShowBudgetPicker] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<'idle' | 'saved'>('idle')

  useEffect(() => {
    const handleResize = () => setTransform(fitStage())
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  const currentNode = scriptNodes[currentStep]
  const currentOption = getOptionById(currentNode, selections[currentNode.id])
  const spent = calculateSpent(selections)
  const remaining = getRemainingBudget(budget, spent)
  const budgetState = getBudgetState(budget, spent)
  const completedCount = scriptNodes.filter((node) => selections[node.id]).length
  const usedPercent = budget > 0 ? Math.max(0, Math.min(100, Math.round((spent / budget) * 100))) : 0

  const previousNode = currentStep > 0 ? scriptNodes[currentStep - 1] : null
  const previousOption = previousNode ? getOptionById(previousNode, selections[previousNode.id]) : null
  const hintNode = currentOption ? currentNode : previousOption ? previousNode : null
  const hintOption = currentOption ?? previousOption

  const hintInsight = useMemo(() => {
    if (!hintNode || !hintOption) {
      return null
    }

    let spentBeforeChoice = 0
    for (const node of scriptNodes) {
      if (node.id === hintNode.id) {
        break
      }

      const selectedId = selections[node.id]
      if (!selectedId) {
        continue
      }

      const selectedOption = getOptionById(node, selectedId)
      if (selectedOption) {
        spentBeforeChoice += selectedOption.price
      }
    }

    return getStepInsight({
      budget,
      spentBeforeChoice,
      currentNode: hintNode,
      chosenOption: hintOption,
      selections,
    })
  }, [budget, hintNode, hintOption, selections])

  const hintCopy = hintInsight ? [hintInsight.pressureLabel, hintInsight.experienceNote].filter(Boolean).join(' · ') : '先选一个方案'

  const handleSelect = (optionId: string) => {
    setSelections((previous) => ({
      ...previous,
      [currentNode.id]: optionId,
    }))
    setCurrentStep((previous) => Math.min(scriptNodes.length - 1, previous + 1))
  }

  const handleReset = () => {
    setBudget(storedBudget)
    setSelections({})
    setCurrentStep(0)
    setShowBudgetPicker(false)
    setSaveFeedback('idle')
  }

  const handleSave = () => {
    saveWenzhouSimSnapshot({ budget, spent, remaining })
    saveWenzhouSimSelections(selections)
    setSaveFeedback('saved')
    setFlowStage('result')
    window.setTimeout(() => {
      navigate('/result', { replace: true })
    }, 300)
  }

  const leftRailStatus = (index: number) => {
    if (index === currentStep) {
      return 'active'
    }

    if (selections[scriptNodes[index].id]) {
      return 'done'
    }

    return 'idle'
  }

  return (
    <main className="wenzhou-screen">
      <section className="stage" style={{ transform }}>
        <div className="paper-texture" />
        <div className="page-cloud cloud-left">☁</div>
        <div className="page-cloud cloud-mid">☁</div>
        <div className="page-cloud cloud-right">☁</div>
        <div className="sparkle sparkle-a">✦</div>
        <div className="sparkle sparkle-b">✦</div>
        <div className="sparkle sparkle-c">✦</div>
        <div className="flower flower-a">✿</div>
        <div className="flower flower-b">✿</div>
        <div className="flower flower-c">✿</div>

        <header className="title-box sketch-card">
          <span className="pin-icon">📍</span>
          <h1>温州城市漫游副本</h1>
        </header>

        <section className="budget-box sketch-card">
          <button type="button" className="budget-number editable" onClick={() => setShowBudgetPicker(true)}>
            <span className="metric-label">总预算</span>
            <strong className="red">{formatMoney(budget)}</strong>
          </button>
          <div className="budget-number">
            <span className="metric-label">已消费</span>
            <strong className="blue">{formatMoney(spent)}</strong>
          </div>
          <div className="budget-number">
            <span className="metric-label">剩余预算</span>
            <strong className="green">{formatMoney(remaining)}</strong>
          </div>
          <div className="usage-row">
            <div className={`usage-bar state-${budgetState}`}>
              <span style={{ width: `${Math.min(100, usedPercent)}%` }} />
            </div>
            <p>已使用 {usedPercent}%</p>
          </div>
        </section>

        <section className="progress-box sketch-card">
          <span className="metric-label">当前进度</span>
          <strong>
            {completedCount} / {scriptNodes.length}
          </strong>
          <div className="progress-dots" aria-hidden="true">
            {scriptNodes.map((node, index) => (
              <span
                key={node.id}
                className={index < currentStep ? 'dot done' : index === currentStep ? 'dot active' : 'dot'}
              />
            ))}
          </div>
        </section>

        <aside className="left-rail">
          <div className="left-art scenic-left">
            <img src={`${import.meta.env.BASE_URL}illustrations/jiangxinyu-sketch.png`} alt="" />
          </div>
          <div className="rail-line" />
          {scriptNodes.map((node, index) => {
            const status = leftRailStatus(index)
            const isChosen = selections[node.id]

            return (
              <button
                key={node.id}
                type="button"
                className={`route-step ${status}`}
                onClick={() => setCurrentStep(index)}
              >
                <span className="step-index">{node.order}</span>
                <span className="step-icon">{node.emoji}</span>
                <span className="step-title">{node.title}</span>
                <span className="step-check">{isChosen ? '✓' : ''}</span>
              </button>
            )
          })}
        </aside>

        <section className="decision-board sketch-card">
          <div className="paper-corner" />
          <div className="board-clip">📎</div>
          <div className="board-header">
            <div className="header-icon-wrap">
              <img src={currentNode.illustration} alt="" />
            </div>
            <div className="header-copy">
              <h2>{currentNode.title}</h2>
              <p className="location-line">📍 {currentNode.location}</p>
              <p className="mission-line">{currentNode.mission}</p>
            </div>
          </div>

          <div
            className={`option-grid option-count-${currentNode.options.length}`}
            style={{ gridTemplateColumns: `repeat(${currentNode.options.length}, minmax(0, 1fr))` }}
          >
            {currentNode.options.map((option, index) => {
              const selected = selections[currentNode.id] === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`option-card palette-${index + 1} ${selected ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.id)}
                >
                  <div className="option-order">{index + 1}</div>
                  <h3>{option.title}</h3>
                  <div className="option-illustration">{optionIcons[option.id] ?? '✨'}</div>
                  <p className="option-desc">{option.description}</p>
                  <strong className="option-price">{formatMoney(option.price)}</strong>
                  <span className="option-radio" />
                </button>
              )
            })}
          </div>
        </section>

        <aside className="right-rail">
          <div className="right-art scenic-right">
            <img src={currentNode.illustration} alt={`${currentNode.title} 场景插图`} />
          </div>
          <div className="robot-box">
            <div className="robot-face">
              <span className="eye" />
              <span className="eye" />
            </div>
          </div>
          <div className="hint-box sketch-card">
            <h3>AI 提示</h3>
            <p>{hintCopy}</p>
          </div>
        </aside>

        <button type="button" className="nav-button done-button" onClick={handleSave}>
          {saveFeedback === 'saved' ? '已保存' : '完成'}
        </button>

        <button type="button" className="dice-reset" onClick={handleReset} title="重新开始">
          🎲
        </button>

        {showBudgetPicker ? (
          <div className="budget-overlay" onClick={() => setShowBudgetPicker(false)}>
            <div className="budget-picker sketch-card" onClick={(event) => event.stopPropagation()}>
              <h3>选择你的总预算</h3>
              <div className="budget-preset-grid">
                {BUDGET_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value === budget ? 'budget-preset active' : 'budget-preset'}
                    onClick={() => {
                      setBudget(value)
                      setShowBudgetPicker(false)
                    }}
                  >
                    {formatMoney(value)}
                  </button>
                ))}
              </div>
              <button type="button" className="close-picker" onClick={() => setShowBudgetPicker(false)}>
                好，就这个
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default WenzhouSimPage
