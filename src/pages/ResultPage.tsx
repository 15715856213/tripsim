import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app-store'
import { scriptNodes } from '@/data/travelScript'
import { calculateSpent } from '@/lib/analysis'
import {
  getItinerarySummary,
  getTravelPersonality,
  getUnlockedAchievements,
} from '@/lib/settlement'
import '../styles/wenzhou-sim.css'
import '../styles/result-settlement.css'

const DESIGN_WIDTH = 1365
const DESIGN_HEIGHT = 768

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const optionIcons: Record<string, string> = {
  'hotel-breakfast': '🍽️',
  'rice-and-soy': '🍚',
  'convenience-combo': '🥪',
  'island-ticket': '🏝️',
  'island-photo-only': '📸',
  'souvenir-shopping': '🛍️',
  'window-shopping': '👀',
  'seafood-feast': '🦀',
  'local-restaurant': '🥘',
  'street-noodle': '🍜',
  'boat-ride': '⛵',
  'riverside-walk': '🌉',
  'instagram-cafe': '☕',
  'chain-coffee': '🧋',
  'store-americano': '🥤',
  'night-cruise': '🚢',
  'night-walk': '🌃',
}

const itineraryMoods = ['🙂', '😎', '🤩', '😋', '🌿', '😌', '💜']

function getBadgeImage(spent: number, budget: number): string {
  if (spent < 200 && spent <= budget) return assetUrl('预算管理大师.png')
  if (spent < 200 && spent > budget) return assetUrl('嘴硬钱包软.png')
  if (spent >= 200 && spent <= budget) return assetUrl('快乐投资人.png')
  return assetUrl('来都来了大师.png')
}

function getBadgeName(spent: number, budget: number): string {
  if (spent < 200 && spent <= budget) return '预算管理大师'
  if (spent < 200 && spent > budget) return '嘴硬钱包软'
  if (spent >= 200 && spent <= budget) return '快乐投资人'
  return '来都来了大师'
}

const formatMoney = (amount: number) => `¥${amount}`

const fitStage = () => {
  if (typeof window === 'undefined') {
    return 'translate(-50%, -50%) scale(1)'
  }

  const viewport = window.visualViewport
  const vw = viewport?.width ?? window.innerWidth
  const vh = viewport?.height ?? window.innerHeight
  const isPortrait = vh > vw
  const shouldRotate = isPortrait && Math.min(vw, vh) < 900
  const safeMargin = vh <= 360 || vw <= 680 ? 8 : 12
  const availableWidth = Math.max(120, vw - safeMargin * 2)
  const availableHeight = Math.max(120, vh - safeMargin * 2)

  let scale = shouldRotate
    ? Math.min(availableWidth / DESIGN_HEIGHT, availableHeight / DESIGN_WIDTH)
    : Math.min(availableWidth / DESIGN_WIDTH, availableHeight / DESIGN_HEIGHT)

  scale = Math.max(0.12, scale * 1.02)
  return `translate(-50%, -50%) rotate(${shouldRotate ? 90 : 0}deg) scale(${scale})`
}

export default function ResultPage() {
  const navigate = useNavigate()
  const wenzhouSimBudget = useAppStore((state) => state.wenzhouSimBudget)
  const wenzhouSimSavedSnapshot = useAppStore((state) => state.wenzhouSimSavedSnapshot)
  const wenzhouSimSelections = useAppStore((state) => state.wenzhouSimSelections)
  const setFlowStage = useAppStore((state) => state.setFlowStage)

  const [transform, setTransform] = useState(fitStage)
  const [shareFeedback, setShareFeedback] = useState('')
  const [badgeModal, setBadgeModal] = useState<{ image: string; name: string } | null>(null)

  useEffect(() => {
    const handleResize = () => setTransform(fitStage())
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('scroll', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
    }
  }, [])

  useEffect(() => {
    if (!shareFeedback) return
    const timer = window.setTimeout(() => setShareFeedback(''), 2200)
    return () => window.clearTimeout(timer)
  }, [shareFeedback])

  const budget = wenzhouSimSavedSnapshot?.budget ?? wenzhouSimBudget
  const selections = wenzhouSimSelections ?? {}
  const spent = wenzhouSimSavedSnapshot?.spent ?? calculateSpent(selections)
  const budgetDelta = budget - spent
  const deltaLabel =
    budgetDelta >= 0 ? `节省 ${formatMoney(budgetDelta)}` : `超出 ${formatMoney(Math.abs(budgetDelta))}`

  const personality = useMemo(() => getTravelPersonality(budget, selections), [budget, selections])
  const achievements = useMemo(() => getUnlockedAchievements(budget, selections), [budget, selections])
  const itinerary = useMemo(() => getItinerarySummary(selections), [selections])

  const handleReplay = () => {
    setFlowStage('wenzhou-budget')
    navigate('/wenzhou-budget', { replace: true })
  }

  const badgeImage = getBadgeImage(spent, budget)
  const badgeName = getBadgeName(spent, budget)

  const handleShare = () => {
    setBadgeModal({ image: badgeImage, name: badgeName })
  }

  const handleSaveLocally = async () => {
    try {
      const response = await fetch(badgeImage)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${badgeName}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setShareFeedback('已保存到本地')
    } catch {
      window.open(badgeImage, '_blank')
      setShareFeedback('请长按图片保存')
    }
  }

  const handleShareImage = async () => {
    try {
      const response = await fetch(badgeImage)
      const blob = await response.blob()
      const file = new File([blob], `${badgeName}.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '温州城市漫游副本结算' })
        setShareFeedback('已调起分享')
        return
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setShareFeedback('图片已复制到剪贴板，可粘贴分享')
        return
      } catch { /* clipboard not supported */ }
    } catch { /* fetch failed */ }

    handleSaveLocally()
  }

  return (
    <main className="wenzhou-screen">
      <section className="stage is-settlement" style={{ transform }}>
        <div className="paper-texture" />

        <div className="settle-tag">旅行日志</div>
        <div className="arc arc-left" />
        <div className="arc arc-right" />
        <div className="stamp stamp-left">温州印象</div>
        <div className="stamp stamp-right">旅途愉快</div>
        <div className="camera-doodle">📷</div>
        <div className="suitcase-doodle">🧳</div>
        <div className="coin-doodle">🪙</div>
        <div className="star-settle star-one">✦</div>
        <div className="star-settle star-two">✦</div>
        <div className="star-settle star-three">✦</div>
        <div className="floral leaf-a">🌿</div>
        <div className="floral leaf-b">🌱</div>
        <div className="floral leaf-c">🍃</div>
        <div className="floral flower-d">🌸</div>
        <div className="floral flower-e">🌼</div>
        <div className="floral flower-f">🌺</div>
        <div className="floral flower-g">💐</div>
        <div className="floral clover-h">🍀</div>

        <header className="settlement-header">
          <div className="banner-tape left" />
          <div className="banner-tape right" />
          <div className="settlement-title-card">
            <h1>《温州城市漫游副本结算》</h1>
          </div>
        </header>

        <section className="amount-panel">
          <div className="amount-row">
            <div className="amount-main">
              <strong>{formatMoney(spent)}</strong>
              {budgetDelta < 0 ? <span className="overspend-alert">!</span> : null}
            </div>
            <div className={`amount-delta ${budgetDelta < 0 ? 'overspend' : 'saving'}`}>
              <span>{budgetDelta < 0 ? '❗' : '🎉'}</span>
              <strong>{deltaLabel}</strong>
            </div>
          </div>
        </section>

        <section className="personality-card sketch-card">
          <div className="masking-tape tape-left-small" />
          <div className="masking-tape tape-right-small" />
          <h2>🎭 旅行人格</h2>
          <div className="personality-name" style={{ background: personality.badgeColor }}>
            {personality.title}
          </div>
          <p className="personality-desc">{personality.description}</p>
          <div className="keyword-row">
            {personality.keywords.map((keyword) => (
              <span key={keyword} className="keyword-pill">
                {keyword}
              </span>
            ))}
          </div>
          <div className="quote-card">
            <span className="quote-mark left">"</span>
            <p>{personality.shareCopy}</p>
            <span className="quote-mark right">"</span>
          </div>
        </section>

        <section className="achievement-book sketch-card">
          <div className="masking-tape tape-top-center" />
          <h2>🏆 获得成就</h2>
          <div className="achievement-grid">
            {achievements.map((achievement) => (
              <article key={achievement.id} className="achievement-card">
                <div className="badge-seal" style={{ '--badge-color': achievement.color } as CSSProperties}>
                  <span className="badge-icon">{achievement.icon}</span>
                </div>
                <strong>{achievement.title}</strong>
                <p>{achievement.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="journey-book sketch-card">
          <div className="book-rings">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <h2>📖 今日旅程</h2>
          <div className="journey-list">
            {itinerary.map((item, index) => (
              <div key={item.id} className="journey-item">
                <span className="journey-time">{item.time}</span>
                <span className="journey-icon">{optionIcons[item.optionId] ?? scriptNodes[index].emoji}</span>
                <strong>{item.title}</strong>
                <span className="journey-mood">{itineraryMoods[index] ?? '🙂'}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="settlement-footer">
          <button type="button" className="settlement-button replay" onClick={handleReplay}>
            🎲 再玩一次
          </button>
          <button type="button" className="settlement-button share" onClick={handleShare}>
            ⤴ 分享我的人格
          </button>
        </footer>

        {shareFeedback ? <div className="share-feedback">{shareFeedback}</div> : null}

        {badgeModal ? (
          <div className="badge-modal-overlay" onClick={() => setBadgeModal(null)}>
            <div className="badge-modal-card" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="badge-modal-x" onClick={() => setBadgeModal(null)}>
                ✕
              </button>
              <h3>{badgeModal.name}</h3>
              <img src={badgeModal.image} alt={badgeModal.name} className="badge-modal-image" />
              <div className="badge-modal-actions">
                <button type="button" className="badge-modal-btn save" onClick={handleSaveLocally}>
                  保存在本地
                </button>
                <button type="button" className="badge-modal-btn share-img" onClick={handleShareImage}>
                  分享图片
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
