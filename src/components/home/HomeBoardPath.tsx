import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Coins, Dice5, Luggage, Plane, Sparkles, Ticket } from 'lucide-react'

type NodeTone = 'leaf' | 'sky' | 'orange' | 'pink'

const toneClasses: Record<NodeTone, string> = {
  leaf: 'bg-leaf/15 text-leaf',
  sky: 'bg-sky/15 text-sky',
  orange: 'bg-orange/15 text-orange',
  pink: 'bg-pink/15 text-pink',
}

const trackNodes: Array<{
  label: string
  icon: LucideIcon
  tone: NodeTone
  left: string
  top: string
  rotate: number
}> = [
  { label: '起点', icon: Plane, tone: 'sky', left: '6%', top: '60%', rotate: -10 },
  { label: '补给', icon: Coins, tone: 'orange', left: '22%', top: '34%', rotate: 7 },
  { label: '住宿', icon: Luggage, tone: 'leaf', left: '40%', top: '66%', rotate: -6 },
  { label: '打卡', icon: Sparkles, tone: 'pink', left: '58%', top: '40%', rotate: 8 },
  { label: '随机', icon: Dice5, tone: 'orange', left: '74%', top: '64%', rotate: -8 },
  { label: '终点', icon: Ticket, tone: 'leaf', left: '90%', top: '44%', rotate: 6 },
]

export default function HomeBoardPath() {
  return (
    <motion.section
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.05 }}
      className="relative overflow-hidden rounded-[2.75rem] border-2 border-ink/10 bg-white/75 p-5 shadow-sketch backdrop-blur md:p-7"
    >
      <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-leaf/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-pink/12 blur-3xl" />

      <div className="relative z-10 h-44 w-full overflow-hidden rounded-[2.25rem] border-2 border-ink/10 bg-paper/80 shadow-soft md:h-52">
        <svg
          viewBox="0 0 900 220"
          className="pointer-events-none absolute inset-0 h-full w-full text-ink/20"
          aria-hidden="true"
        >
          <path
            d="M60 160 C 200 30, 330 250, 470 110 S 710 40, 840 140"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="16 16"
            fill="none"
          />
          <path
            d="M60 160 C 200 30, 330 250, 470 110 S 710 40, 840 140"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.65"
            fill="none"
          />
        </svg>

        {trackNodes.map((node, index) => (
          <TrackNode key={node.label} index={index} {...node} />
        ))}

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute left-6 top-7 rounded-[1.4rem] border-2 border-white bg-white/85 p-3 shadow-soft"
          style={{ rotate: '-8deg' }}
        >
          <div className="rounded-[1rem] bg-sky/15 p-2 text-sky">
            <Plane size={18} />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 7, 0], rotate: [6, 2, 6] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute bottom-8 right-10 rounded-[1.4rem] border-2 border-white bg-white/85 p-3 shadow-soft"
          style={{ rotate: '6deg' }}
        >
          <div className="rounded-[1rem] bg-orange/15 p-2 text-orange">
            <Dice5 size={18} />
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

type TrackNodeProps = (typeof trackNodes)[number] & {
  index: number
}

function TrackNode({ label, icon: Icon, tone, left, top, rotate, index }: TrackNodeProps) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.08 + index * 0.05 }}
      className="absolute"
      style={{ left, top }}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center gap-2"
        style={{ rotate: `${rotate}deg` }}
      >
        <div className="rounded-[1.35rem] border-2 border-white bg-white/90 p-2 shadow-soft">
          <div className={`flex h-10 w-10 items-center justify-center rounded-[1.1rem] ${toneClasses[tone]}`}>
            <Icon size={18} />
          </div>
        </div>
        <span className="hidden rounded-full border border-ink/10 bg-white/75 px-3 py-1 text-xs font-semibold text-ink/65 shadow-sm md:inline-flex">
          {label}
        </span>
      </motion.div>
    </motion.div>
  )
}
