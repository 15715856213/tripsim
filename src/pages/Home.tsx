import { useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/app-store'
import { initHomeEffects } from '@/lib/home-effects'
import '@/styles/home-handdrawn.css'

async function lockLandscape() {
  try {
    if (document.fullscreenEnabled && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    }
    if ((screen.orientation as any)?.lock) {
      await (screen.orientation as any).lock('landscape')
    }
  } catch {
    // orientation lock is a progressive enhancement
  }
}

async function unlockOrientation() {
  try {
    if (screen.orientation?.unlock) {
      screen.orientation.unlock()
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  } catch {
    // ignore
  }
}

export default function Home() {
  const draftLink = useAppStore((state) => state.draftLink)
  const setDraftLink = useAppStore((state) => state.setDraftLink)
  const setFlowStage = useAppStore((state) => state.setFlowStage)

  useEffect(() => {
    initHomeEffects()
  }, [])

  const handleInputFocus = useCallback(() => {
    lockLandscape()
  }, [])

  const handleInputBlur = useCallback(() => {
    unlockOrientation()
  }, [])

  return (
    <main className="stage" aria-label="TripSim 手绘旅行首页">
      {/* 纸张纹理层 */}
      <div className="paper-texture" />
      <div className="pencil-lines" />
      <div className="random-sparkles" id="sparkles" />
      <div className="hero-glow-ring hero-glow-ring--one" aria-hidden="true" />
      <div className="hero-glow-ring hero-glow-ring--two" aria-hidden="true" />
      <div className="floating-ticket floating-ticket--left" aria-hidden="true">
        <span>TRIP</span>
      </div>
      <div className="floating-ticket floating-ticket--right" aria-hidden="true">
        <span>GO</span>
      </div>

      {/* 左上太阳 */}
      <section className="sun-wrap float-slow" aria-hidden="true">
        <div className="sun-rays" />
        <div className="sun-face">
          <span className="eye eye-left" />
          <span className="eye eye-right" />
          <span className="mouth" />
        </div>
      </section>

      {/* 顶部云朵 */}
      <div className="cloud cloud-left cloud-drift-a" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="cloud cloud-mid cloud-drift-b" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="cloud cloud-right cloud-drift-c" aria-hidden="true">
        <span /><span /><span />
      </div>

      {/* Logo 区域 */}
      <header className="logo-area gentle-bob">
        <div className="logo-dice" aria-hidden="true">
          <div className="dice-face top"><i /><i /><i /></div>
          <div className="dice-face left"><i /><i /><i /></div>
          <div className="dice-face right"><i /><i /><i /></div>
        </div>
        <div className="logo-text-wrap">
          <h1 className="logo-text" aria-label="TripSim">
            <span className="c-t">T</span><span className="c-r">r</span><span className="c-i">i</span><span className="c-p">p</span><span className="c-s">S</span><span className="c-ii">i</span><span className="c-m">m</span>
          </h1>
          <p className="logo-subtitle">旅行预算模拟器</p>
        </div>
      </header>

      {/* 右上角开始试玩纸牌 */}
      <button className="start-card" type="button" aria-label="开始试玩"
        onClick={() => document.getElementById('trip-link')?.focus()}>
        <span className="tape tape-left" />
        <span className="tape tape-right" />
        <span className="star">★</span> 开始试玩
      </button>

      {/* 热气球 */}
      <div className="balloon balloon-float" aria-hidden="true">
        <div className="balloon-body">
          <span className="stripe stripe-1" />
          <span className="stripe stripe-2" />
          <span className="stripe stripe-3" />
          <span className="stripe stripe-4" />
        </div>
        <div className="balloon-lines"><i /><i /><i /></div>
        <div className="balloon-basket" />
      </div>

      {/* 中央标题和输入控件 */}
      <section className="hero-content">
        <div className="title-block title-breathe">
          <h2 className="hero-title line-one">
            <span className="pink-word">先试玩</span><span className="orange-word">旅行，</span>
          </h2>
          <h2 className="hero-title line-two">再决定出不出发！</h2>
        </div>

        {/* 输入框 */}
        <div className="empty-input-shell" aria-label="粘贴旅行视频链接">
          <input
            id="trip-link"
            type="text"
            value={draftLink}
            onChange={(e) => setDraftLink(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="粘贴抖音旅行视频链接..."
            style={{
              position: 'absolute',
              inset: 0,
              border: 'none',
              background: 'transparent',
              padding: '0 20px',
              fontSize: 'clamp(16px, 1.2vw, 20px)',
              outline: 'none',
              color: '#302717',
              fontFamily: 'inherit',
              fontWeight: 600,
              letterSpacing: '0.04em',
              borderRadius: 'inherit',
              zIndex: 2,
            }}
          />
        </div>

        {/* 主按钮 */}
        <Link
          to="/loading"
          onClick={() => setFlowStage('loading')}
          className="empty-main-button"
          aria-label="开始你的Tripsim"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: 'white',
            fontWeight: 900,
            fontSize: 'clamp(18px, 1.4vw, 26px)',
            letterSpacing: '0.1em',
          }}
        >
          开始你的Tripsim
        </Link>
      </section>

      {/* 左侧旅行起点场景 */}
      <section className="left-scene" aria-hidden="true">
        <div className="rainbow"><span /><span /><span /></div>
        <div className="left-hill hill-back" />
        <div className="left-hill hill-front" />
        <div className="tree tree-left"><i /></div>
        <div className="little-bus">
          <div className="bus-window w1" />
          <div className="bus-window w2" />
          <div className="bus-wheel wheel-a" />
          <div className="bus-wheel wheel-b" />
        </div>
        <div className="wood-sign">
          <div className="sign-board">冒险从这里开始！</div>
          <div className="sign-post" />
        </div>
        <div className="grass grass-a" />
        <div className="grass grass-b" />
      </section>

      {/* 右侧远山场景 */}
      <section className="right-scene" aria-hidden="true">
        <svg className="mountain-svg" viewBox="0 0 520 360" preserveAspectRatio="none">
          <path className="mountain mountain-far" d="M30 270 L120 70 L210 190 L320 55 L505 145 L505 360 L30 360 Z" />
          <path className="mountain mountain-near" d="M0 300 C90 195 170 170 260 190 C325 115 380 105 520 190 L520 360 L0 360 Z" />
          <path className="snow snow-a" d="M120 70 L158 120 L92 116 Z" />
          <path className="snow snow-b" d="M320 55 L365 105 L285 100 Z" />
          <path className="crayon-line" d="M20 295 C130 230 230 242 320 210 C385 188 440 205 515 245" />
          <path className="hill-road" d="M155 245 C240 236 335 265 485 318" />
        </svg>
        <div className="right-tree"><i /></div>
      </section>

      {/* 底部草地 */}
      <div className="ground ground-back" aria-hidden="true" />
      <div className="ground ground-front" aria-hidden="true" />

      {/* 底部桌游路径 */}
      <section className="board-path" aria-hidden="true">
        <div className="tile purple" style={{ '--x': 4, '--y': 13, '--r': '-2deg' } as React.CSSProperties}><b>★</b></div>
        <div className="tile blue" style={{ '--x': 10, '--y': 16, '--r': '-4deg' } as React.CSSProperties}><b>↗</b></div>
        <div className="tile red" style={{ '--x': 16, '--y': 19, '--r': '2deg' } as React.CSSProperties}><b>?</b></div>
        <div className="tile orange" style={{ '--x': 22, '--y': 21, '--r': '1deg' } as React.CSSProperties}><b>▶</b></div>
        <div className="tile teal" style={{ '--x': 28, '--y': 23, '--r': '-2deg' } as React.CSSProperties}><b>●</b></div>
        <div className="tile pink" style={{ '--x': 34, '--y': 26, '--r': '3deg' } as React.CSSProperties}><b>★</b></div>
        <div className="tile cyan" style={{ '--x': 40, '--y': 29, '--r': '-1deg' } as React.CSSProperties}><b>⚑</b></div>
        <div className="tile orange" style={{ '--x': 46, '--y': 31, '--r': '1deg' } as React.CSSProperties}><b>▶</b></div>
        <div className="tile green" style={{ '--x': 52, '--y': 30, '--r': '-3deg' } as React.CSSProperties}><b>★</b></div>
        <div className="tile purple-dark" style={{ '--x': 58, '--y': 28, '--r': '2deg' } as React.CSSProperties}><b>?</b></div>
        <div className="tile blue" style={{ '--x': 64, '--y': 25, '--r': '-2deg' } as React.CSSProperties}><b>✈</b></div>
        <div className="tile red" style={{ '--x': 70, '--y': 22, '--r': '2deg' } as React.CSSProperties}><b>●</b></div>
        <div className="tile yellow-green" style={{ '--x': 76, '--y': 20, '--r': '-1deg' } as React.CSSProperties}><b>▶</b></div>
        <div className="tile purple" style={{ '--x': 82, '--y': 19, '--r': '2deg' } as React.CSSProperties}><b>★</b></div>
        <div className="tile red" style={{ '--x': 88, '--y': 21, '--r': '-2deg' } as React.CSSProperties}><b>⚑</b></div>
        <div className="tile teal" style={{ '--x': 94, '--y': 23, '--r': '1deg' } as React.CSSProperties}><b>?</b></div>
        <div className="tile yellow" style={{ '--x': 100, '--y': 26, '--r': '3deg' } as React.CSSProperties}><b>★</b></div>
      </section>

      {/* 棋子和骰子 */}
      <div className="pawn pawn-blue pawn-float-a" aria-hidden="true" />
      <div className="pawn pawn-red pawn-float-b" aria-hidden="true" />
      <div className="bottom-dice" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      {/* 前景草、小花点缀 */}
      <div className="foreground-doodles" id="doodles" />
    </main>
  )
}
