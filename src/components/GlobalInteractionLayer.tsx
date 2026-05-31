import { useEffect } from 'react'

const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, summary, [role="button"], [data-clickable="true"]'

type ClickTone = 'ambient' | 'action'

let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === 'undefined') return null

  const AudioContextCtor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioContextCtor) return null

  audioContext ??= new AudioContextCtor()
  return audioContext
}

function playClickSound(tone: ClickTone) {
  const context = getAudioContext()
  if (!context) return

  if (context.state === 'suspended') {
    void context.resume()
  }

  const now = context.currentTime
  const output = context.createGain()
  const pop = context.createOscillator()
  const shimmer = context.createOscillator()
  const filter = context.createBiquadFilter()

  const isAction = tone === 'action'
  const baseFrequency = isAction ? 720 : 520

  output.gain.setValueAtTime(0.0001, now)
  output.gain.exponentialRampToValueAtTime(isAction ? 0.08 : 0.045, now + 0.012)
  output.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(isAction ? 2600 : 1900, now)
  filter.frequency.exponentialRampToValueAtTime(560, now + 0.14)

  pop.type = 'triangle'
  pop.frequency.setValueAtTime(baseFrequency, now)
  pop.frequency.exponentialRampToValueAtTime(baseFrequency * 0.42, now + 0.13)

  shimmer.type = 'sine'
  shimmer.frequency.setValueAtTime(baseFrequency * 1.55, now)
  shimmer.frequency.exponentialRampToValueAtTime(baseFrequency * 1.12, now + 0.09)

  pop.connect(filter)
  shimmer.connect(filter)
  filter.connect(output)
  output.connect(context.destination)

  pop.start(now)
  shimmer.start(now + 0.008)
  pop.stop(now + 0.15)
  shimmer.stop(now + 0.12)
}

function emitClickEffect(x: number, y: number, tone: ClickTone) {
  const layer = document.getElementById('global-click-layer')
  if (!layer) return

  const ripple = document.createElement('span')
  ripple.className = `click-ripple click-ripple--${tone}`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  layer.appendChild(ripple)

  const particleCount = tone === 'action' ? 9 : 5
  for (let index = 0; index < particleCount; index += 1) {
    const spark = document.createElement('span')
    const angle = (Math.PI * 2 * index) / particleCount
    const distance = 22 + Math.random() * (tone === 'action' ? 34 : 20)

    spark.className = `click-spark click-spark--${tone}`
    spark.style.left = `${x}px`
    spark.style.top = `${y}px`
    spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`)
    spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`)
    spark.style.animationDelay = `${Math.random() * 45}ms`
    layer.appendChild(spark)
    spark.addEventListener('animationend', () => spark.remove(), { once: true })
  }

  ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
}

export default function GlobalInteractionLayer() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return

      const target = event.target instanceof Element ? event.target : null
      const interactiveTarget = target?.closest<HTMLElement>(INTERACTIVE_SELECTOR)
      const isDisabled =
        interactiveTarget?.matches(':disabled, [aria-disabled="true"], .empty-main-button--disabled') ?? false
      const tone: ClickTone = interactiveTarget && !isDisabled ? 'action' : 'ambient'

      emitClickEffect(event.clientX, event.clientY, tone)
      playClickSound(tone)

      if (interactiveTarget && !isDisabled) {
        interactiveTarget.classList.remove('click-press-pop')
        void interactiveTarget.offsetWidth
        interactiveTarget.classList.add('click-press-pop')
      }
    }

    const handleAnimationEnd = (event: AnimationEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && target.classList.contains('click-press-pop')) {
        target.classList.remove('click-press-pop')
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, { capture: true })
    document.addEventListener('animationend', handleAnimationEnd)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true })
      document.removeEventListener('animationend', handleAnimationEnd)
    }
  }, [])

  return <div id="global-click-layer" className="click-fx-layer" aria-hidden="true" />
}
