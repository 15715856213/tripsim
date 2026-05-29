import { motion } from 'framer-motion'
import { ArrowRight, Compass, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import HomeBoardPath from '@/components/home/HomeBoardPath'
import { useAppStore } from '@/store/app-store'

export default function Home() {
  const draftLink = useAppStore((state) => state.draftLink)
  const setDraftLink = useAppStore((state) => state.setDraftLink)
  const setFlowStage = useAppStore((state) => state.setFlowStage)

  return (
    <section className="space-y-10">
      <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden rounded-[2.75rem] border-2 border-ink/10 bg-white/80 p-6 shadow-sketch backdrop-blur md:p-10"
      >
        <div className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full bg-pink/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 h-44 w-44 rounded-full bg-sky/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-orange/12 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="flex flex-wrap items-center justify-between gap-3 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper/80 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-ink/70">
              <span className="rounded-full bg-leaf/15 p-1 text-leaf">
                <Compass size={14} />
              </span>
              旅行预算模拟器
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('trip-link')?.focus()}
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink/10 bg-white/85 px-4 py-2 text-xs font-semibold text-ink shadow-soft transition hover:-translate-y-0.5"
            >
              <Star size={14} className="text-orange" />
              开始试玩
            </button>
          </div>

          <h1 className="mt-8 text-4xl font-black leading-tight text-ink md:text-6xl">
            先试玩旅行，
            <br />
            再决定出不出发！
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink/70 md:text-lg">
            粘贴一条旅行视频链接，把路线变成桌游棋盘式的预算副本，提前看到交通、住宿、吃喝与随机花费的节奏。
          </p>

          <div className="mt-7 rounded-[2.25rem] border-2 border-ink/10 bg-white/85 p-5 shadow-soft md:p-6">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <label className="sr-only" htmlFor="trip-link">
                  粘贴抖音旅行视频链接
                </label>
                <input
                  id="trip-link"
                  value={draftLink}
                  onChange={(event) => setDraftLink(event.target.value)}
                  placeholder="粘贴抖音旅行视频链接..."
                  className="h-12 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 pr-10 outline-none transition focus:border-sky/50 focus:bg-white"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/35">
                  <Sparkles size={18} />
                </span>
              </div>

              <Link
                to="/loading"
                onClick={() => setFlowStage('loading')}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-leaf px-6 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-leaf/90"
              >
                生成旅行副本
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['交通与住宿大头', '随机花费留白', '棋盘路线预览'].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-ink/10 bg-paper/80 px-3 py-1.5 text-xs font-semibold text-ink/60"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <HomeBoardPath />
    </section>
  )
}
