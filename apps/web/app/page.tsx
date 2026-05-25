/**
 * Root Home Page of the ParkGolfFinder Web Application
 * ParkGolfFinder 웹 애플리케이션의 루트 홈 페이지
 */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-6 md:p-12">
      <header className="mb-12 text-center md:text-left">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          모던 파크골프 가이드 / Modern Park Golf Guide
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          ParkGolf<span className="text-emerald-400">Finder</span>
        </h1>
        <p className="text-slate-400 max-w-xl text-lg">
          전국 파크골프장의 위치 정보와 예약 방법, 요금 요약을 쉽고 빠르게 필터링하여 조회하세요.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Left column - Filter parameters */}
        {/* 왼쪽 열 - 필터 매개변수 */}
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            검색 및 필터 / Search & Filter
          </h2>
          <div className="space-y-4">
            <div className="h-10 bg-slate-800/40 rounded-lg animate-pulse"></div>
            <div className="h-24 bg-slate-800/40 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-slate-800/40 rounded-lg animate-pulse"></div>
          </div>
        </aside>

        {/* Right column - Main list area */}
        {/* 오른쪽 열 - 메인 시설 목록 영역 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl min-h-[400px] flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              시설 목록 / Facilities List
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-32 bg-slate-800/20 rounded-xl border border-slate-800/50 p-4 flex flex-col justify-between">
                <div className="w-1/2 h-4 bg-slate-800/50 rounded animate-pulse"></div>
                <div className="w-3/4 h-3 bg-slate-800/50 rounded animate-pulse"></div>
              </div>
              <div className="h-32 bg-slate-800/20 rounded-xl border border-slate-800/50 p-4 flex flex-col justify-between">
                <div className="w-1/3 h-4 bg-slate-800/50 rounded animate-pulse"></div>
                <div className="w-2/3 h-3 bg-slate-800/50 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <footer className="text-center text-xs text-slate-600 mt-12">
            © 2026 ParkGolfFinder. All rights reserved.
          </footer>
        </div>
      </section>
    </main>
  );
}
