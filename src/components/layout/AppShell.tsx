import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export default function AppShell() {
  return (
    <div className="page-shell min-h-screen px-6 py-6 text-ink md:px-10">
      <div className="shell-orb shell-orb--left" aria-hidden="true" />
      <div className="shell-orb shell-orb--right" aria-hidden="true" />
      <div className="shell-route" aria-hidden="true" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <motion.header
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="shell-header-card rounded-3xl border-2 border-ink/15 bg-white/85 p-4 shadow-sketch backdrop-blur"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-2xl bg-leaf/20 p-2 text-leaf shadow-soft">
                <Compass size={18} />
              </span>
              <p className="text-sm font-semibold tracking-wide">旅行预算模拟器</p>
            </div>
            <span className="ml-auto rounded-full border border-orange/20 bg-orange/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-orange">
              TripSim Lab
            </span>
          </div>
        </motion.header>

        <main className="shell-main-card rounded-3xl border-2 border-ink/10 bg-white/75 p-6 shadow-soft backdrop-blur md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
