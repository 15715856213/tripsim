import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-paper px-6 py-6 text-ink md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <motion.header
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl border-2 border-ink/15 bg-white/80 p-4 shadow-sketch backdrop-blur"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-2xl bg-leaf/20 p-2 text-leaf">
                <Compass size={18} />
              </span>
              <p className="text-sm font-semibold tracking-wide">旅行预算模拟器</p>
            </div>
          </div>
        </motion.header>

        <main className="rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-soft backdrop-blur md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
