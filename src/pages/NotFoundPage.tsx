import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-lg rounded-[2rem] border-2 border-ink/10 bg-white/90 p-8 text-center shadow-sketch">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky">404</p>
        <h1 className="mt-2 text-4xl font-black">这条路线走丢了</h1>
        <p className="mt-4 text-ink/70">当前只初始化了首页、加载页、副本页和结算页四个基础入口。</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-leaf px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-leaf/90"
        >
          返回首页
        </Link>
      </div>
    </section>
  )
}
