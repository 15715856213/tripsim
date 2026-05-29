import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app-store'

const steps = ['分析旅行路线...', '提取景点信息...', '搜集相关资料...', '构建副本世界...'] as const
const STEP_DURATION_MS = 600

export default function LoadingPage() {
  const navigate = useNavigate()
  const draftLink = useAppStore((state) => state.draftLink)
  const resolveScenarioByDraftLink = useAppStore((state) => state.resolveScenarioByDraftLink)
  const setFlowStage = useAppStore((state) => state.setFlowStage)
  const [activeStep, setActiveStep] = useState(0)

  const totalDuration = useMemo(() => steps.length * STEP_DURATION_MS, [])

  useEffect(() => {
    const stepTimers = steps.map((_, index) =>
      window.setTimeout(() => {
        setActiveStep(index)
      }, index * STEP_DURATION_MS),
    )

    const finishTimer = window.setTimeout(() => {
      resolveScenarioByDraftLink(draftLink)
      setFlowStage('journey')
      navigate('/journey', { replace: true })
    }, totalDuration)

    return () => {
      stepTimers.forEach((timer) => window.clearTimeout(timer))
      window.clearTimeout(finishTimer)
    }
  }, [draftLink, navigate, resolveScenarioByDraftLink, setFlowStage, totalDuration])

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky">AI Loading</p>
        <h1 className="text-3xl font-black md:text-4xl">正在生成你的旅行副本世界</h1>
        <p className="max-w-2xl text-ink/70">页面会基于当前链接做一次本地伪解析，并在短暂停留后自动进入旅程页。</p>
      </div>

      <div className="grid gap-4 rounded-[2rem] border-2 border-ink/10 bg-white/90 p-6 shadow-sketch">
        {steps.map((step, index) => {
          const isActive = index === activeStep
          const isCompleted = index < activeStep

          return (
            <motion.div
              key={step}
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center gap-4 rounded-2xl bg-paper px-4 py-4"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition ${
                  isActive || isCompleted ? 'bg-leaf text-white' : 'bg-leaf/15 text-leaf'
                }`}
              >
                {index + 1}
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky via-leaf to-orange"
                  initial={false}
                  animate={{
                    width: isCompleted ? '100%' : isActive ? '78%' : '18%',
                    opacity: isActive || isCompleted ? 1 : 0.45,
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
              <p className={`w-44 text-sm font-semibold ${isActive ? 'text-ink' : 'text-ink/80'}`}>{step}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
