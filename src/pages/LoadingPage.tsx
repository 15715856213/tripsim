import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app-store'
import { initLoadingEffects } from '@/lib/loading-effects'
import '@/styles/loading-page.css'

export default function LoadingPage() {
  const navigate = useNavigate()
  const draftLink = useAppStore((state) => state.draftLink)
  const resolveScenarioByDraftLink = useAppStore((state) => state.resolveScenarioByDraftLink)
  const setFlowStage = useAppStore((state) => state.setFlowStage)

  useEffect(() => {
    const cleanup = initLoadingEffects(() => {
      resolveScenarioByDraftLink(draftLink)
      setFlowStage('budget-sim')
      navigate('/budget-sim', { replace: true })
    })

    return cleanup
  }, [draftLink, navigate, resolveScenarioByDraftLink, setFlowStage])

  return (
    <main className="screen" aria-label="TripSim AI loading page">
      <section className="stage" id="stage">
        <div className="paper-texture" />
        <div className="purple-scribble scribble-top" />
        <div className="purple-scribble scribble-left" />
        <div className="purple-scribble scribble-right" />
        <div className="purple-scribble scribble-bottom" />

        {/* 背景星星与点状涂鸦 */}
        <div className="star star-1">✦</div>
        <div className="star star-2">✧</div>
        <div className="star star-3">✦</div>
        <div className="star star-4">✧</div>
        <div className="dot dot-1" />
        <div className="dot dot-2" />
        <div className="dot dot-3" />
        <div className="dot dot-4" />

        {/* 页面标题 */}
        <h1 className="main-title">正在生成你的旅行副本...</h1>

        {/* 右上角手绘小火箭 */}
        <div className="rocket doodle-wiggle" aria-hidden="true">
          <svg viewBox="0 0 92 112" role="img">
            <path className="rocket-body" d="M55 9 C72 20 75 42 62 67 L45 97 L26 58 C18 38 29 17 55 9 Z" />
            <path className="rocket-window" d="M55 30 C61 32 63 39 59 45 C55 51 47 50 44 44 C41 38 47 29 55 30 Z" />
            <path className="rocket-fin-left" d="M28 61 L9 77 L34 82 Z" />
            <path className="rocket-fin-right" d="M59 67 L84 73 L53 90 Z" />
            <path className="rocket-flame" d="M32 83 C25 95 26 104 37 99 C43 108 51 100 48 87 Z" />
            <path className="rocket-outline" d="M55 9 C72 20 75 42 62 67 L45 97 L26 58 C18 38 29 17 55 9 Z" />
          </svg>
        </div>

        {/* 左侧加载任务纸片 */}
        <aside className="loading-card hand-card" aria-label="AI 任务加载列表">
          <span className="tape tape-left" />
          <span className="tape tape-right" />
          <div className="inner-paper">
            <ul className="task-list" id="taskList">
              <li className="task-item pending">
                <span className="progress-icon" aria-hidden="true" />
                <span className="task-text">分析旅行路线...</span>
              </li>
              <li className="task-item pending">
                <span className="progress-icon" aria-hidden="true" />
                <span className="task-text">提取景点信息...</span>
              </li>
              <li className="task-item pending">
                <span className="progress-icon" aria-hidden="true" />
                <span className="task-text">计算预算结构...</span>
              </li>
              <li className="task-item pending">
                <span className="progress-icon" aria-hidden="true" />
                <span className="task-text">生成穷游方案...</span>
              </li>
              <li className="task-item pending">
                <span className="progress-icon" aria-hidden="true" />
                <span className="task-text">构建现实副本...</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* 右侧线圈本生成草稿区 */}
        <section className="notebook hand-card" aria-label="旅行路线草稿本">
          <div className="spiral-row" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span />
            <span /><span /><span /><span /><span /><span /><span />
          </div>

          <div className="notebook-lines" />

          {/* 极淡地图涂鸦背景 */}
          <svg className="map-doodles" viewBox="0 0 560 260" aria-hidden="true">
            <path className="soft-line" d="M45 171 C105 150 154 185 220 164 S348 144 423 169" />
            <path className="soft-line" d="M90 70 C172 48 260 66 346 51 S468 60 520 42" />
            <path className="tiny-tree" d="M85 101 L105 62 L126 101 M105 64 L105 126" />
            <path className="tiny-tree" d="M455 118 L471 84 L489 118 M471 84 L471 137" />
            <path className="water" d="M285 119 q10 -10 20 0 t20 0 t20 0" />
            <path className="water" d="M282 135 q10 -10 20 0 t20 0 t20 0" />
            <polygon className="pale-shape" points="160,76 176,63 192,78 178,94" />
            <polygon className="pale-shape" points="395,67 412,58 424,72 409,86" />
            <polygon className="pale-shape pink" points="486,99 510,108 506,132 479,126" />
            <path className="tiny-hill" d="M192 144 C219 111 238 111 264 145" />
            <path className="tiny-hill" d="M384 157 C407 131 430 130 453 158" />
          </svg>

          {/* 逐渐显现的路线图 */}
          <svg className="route-map" viewBox="0 0 560 210" aria-label="旅行路线生成动画">
            <path className="route-shadow" d="M56 120 C92 72 122 142 166 96 S238 64 282 92 S354 136 404 95 S470 103 510 45" />
            <path className="route-line" id="routeLine" d="M56 120 C92 72 122 142 166 96 S238 64 282 92 S354 136 404 95 S470 103 510 45" />

            <g className="route-icon mountain node node-1" data-delay="0">
              <path d="M35 119 L62 65 L89 119 Z" />
              <path d="M57 76 L65 95 L72 84" />
            </g>

            <g className="route-node-wrap node node-2" data-delay="420">
              <circle className="route-node node-purple" cx="108" cy="132" r="16" />
              <circle className="route-dot" cx="108" cy="132" r="4" />
            </g>
            <g className="route-node-wrap node node-3" data-delay="920">
              <circle className="route-node node-blue" cx="174" cy="96" r="16" />
              <circle className="route-dot" cx="174" cy="96" r="4" />
            </g>
            <g className="route-node-wrap node node-4" data-delay="1420">
              <circle className="route-node node-green" cx="245" cy="70" r="16" />
              <circle className="route-dot" cx="245" cy="70" r="4" />
            </g>
            <g className="route-node-wrap node node-5" data-delay="1920">
              <circle className="route-node node-yellow" cx="330" cy="112" r="16" />
              <circle className="route-dot" cx="330" cy="112" r="4" />
            </g>
            <g className="route-node-wrap node node-6" data-delay="2360">
              <circle className="route-node node-orange" cx="413" cy="114" r="16" />
              <circle className="route-dot" cx="413" cy="114" r="4" />
            </g>
            <g className="route-icon pin node node-7" data-delay="2780">
              <path d="M500 56 C500 35 531 34 531 56 C531 73 516 88 516 88 C516 88 500 73 500 56 Z" />
              <circle cx="516" cy="56" r="7" />
            </g>
          </svg>

          {/* 预算结构分析区与两条进度条 */}
          <div className="analysis-panel" aria-label="预算结构分析进度">
            <div className="analysis-label">预算结构分析中...</div>
            <div className="budget-bar bar-green">
              <span className="bar-fill" id="barFillOne" />
            </div>
            <div className="budget-bar bar-orange">
              <span className="bar-fill" id="barFillTwo" />
            </div>
          </div>

          {/* 右下角小相机 */}
          <div className="camera doodle-shake" aria-hidden="true">
            <svg viewBox="0 0 92 72">
              <path className="camera-body" d="M13 22 C16 16 27 17 33 18 L39 10 L60 10 L66 18 C73 18 82 17 85 24 L85 58 C84 65 78 67 70 66 L20 66 C13 66 9 62 9 56 L9 30 C9 26 10 24 13 22 Z" />
              <circle className="camera-lens" cx="47" cy="43" r="14" />
              <circle className="camera-lens-inner" cx="47" cy="43" r="7" />
              <circle className="camera-dot" cx="72" cy="25" r="4" />
            </svg>
          </div>
        </section>

        {/* 底部提示 */}
        <footer className="bottom-hint" id="bottomHint">
          <div className="robot" aria-hidden="true">
            <svg viewBox="0 0 86 66">
              <path d="M20 20 C20 13 26 10 33 10 L54 10 C62 10 67 14 67 21 L67 45 C67 53 62 57 54 57 L31 57 C24 57 19 53 19 45 Z" />
              <path d="M43 10 L43 2" />
              <circle cx="32" cy="34" r="4" />
              <circle cx="54" cy="34" r="4" />
              <path d="M11 30 L19 30 M67 30 L76 30" />
            </svg>
          </div>
          <span id="hintText">AI 正在理解这个视频的真实成本</span>
        </footer>
      </section>
    </main>
  )
}
