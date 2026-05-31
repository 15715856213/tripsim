import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app-store'
import '../styles/wenzhou-sim.css'

const DESIGN_WIDTH = 1365
const DESIGN_HEIGHT = 768

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

export default function WenzhouBudgetPage() {
  const navigate = useNavigate()
  const setFlowStage = useAppStore((state) => state.setFlowStage)
  const setWenzhouSimBudget = useAppStore((state) => state.setWenzhouSimBudget)
  const [budgetInput, setBudgetInput] = useState('')
  const [transform, setTransform] = useState(fitStage)

  const parsedBudget = useMemo(() => {
    const value = Number(budgetInput)
    if (!Number.isFinite(value)) {
      return null
    }

    const rounded = Math.round(value)
    return rounded > 0 ? rounded : null
  }, [budgetInput])

  const canSubmit = parsedBudget !== null

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

  const handleStart = () => {
    if (!parsedBudget) {
      return
    }

    setWenzhouSimBudget(parsedBudget)
    setFlowStage('wenzhou-sim')
    navigate('/wenzhou-sim', { replace: true })
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

        <div className="budget-sticker budget-sticker--coin" aria-hidden="true">¥</div>
        <div className="budget-sticker budget-sticker--map" aria-hidden="true">MAP</div>
        <div className="budget-sticker budget-sticker--ticket" aria-hidden="true">PASS</div>
        <div className="budget-path-dots" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>

        <header className="title-box sketch-card">
          <span className="pin-icon">📍</span>
          <h1>温州城市漫游副本</h1>
        </header>

        <section className="budget-entry sketch-card" aria-label="预算输入卡片">
          <h2>输入预算</h2>
          <p>请横屏操作</p>
          <input
            inputMode="numeric"
            type="number"
            min={1}
            step={1}
            value={budgetInput}
            onChange={(event) => setBudgetInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleStart()
              }
            }}
            className="budget-entry-input"
          />
          <button type="button" className="close-picker" onClick={handleStart} disabled={!canSubmit}>
            开始副本
          </button>
        </section>
      </section>
    </main>
  )
}
