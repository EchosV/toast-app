'use client'

import type { TabName } from '@/components/bottom-nav'

interface HomeTabProps {
  onNavigate: (tab: TabName) => void
  libraryCount: number
}

// Nav bar height: py-0.5 (4px top+bottom) + icon 32px + gap 2px + label ~14px = ~52px
// We use a CSS variable so it's easy to tweak in one place
const NAV_H = 52

export function HomeTab({ onNavigate }: HomeTabProps) {
  return (
    <>
      <style>{`
        :root {
          --nav-h: ${NAV_H}px;
          --gap: 8px;
          --pad: 10px;
          --radius: 16px;
        }

        /* ─────────────────────────────────────────
           OUTER WRAPPER
           Fills the screen above the nav bar.
        ───────────────────────────────────────── */
        .hg-wrap {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 480px;
          height: calc(100dvh - var(--nav-h));
          padding: var(--pad);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: var(--gap);
          background: transparent;
          overflow: hidden;
        }

        /* ─────────────────────────────────────────
           TOP ROW  (A + C  |  left + right columns)
           Fills all space above section E.
           We use a nested flex row for the top area.
        ───────────────────────────────────────── */
        .hg-top {
          flex: 1;
          display: grid;
          /* Left col = right col in width */
          grid-template-columns: 1fr 1fr;
          gap: var(--gap);
          min-height: 0;
        }

        /* ─── Left column: A on top, B on bottom ─── */
        .hg-left {
          display: flex;
          flex-direction: column;
          gap: var(--gap);
          min-height: 0;
        }

        .hg-panel-a {
          flex: 1;
        }

        .hg-panel-b {
          flex: 1;
        }

        /* ─── Right column: C (flex grow) + D (square) ─── */
        .hg-right {
          display: flex;
          flex-direction: column;
          gap: var(--gap);
          min-height: 0;
        }

        /* C grows to fill whatever space D doesn't take */
        .hg-section-c {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          /* No frame, no background, no shadow, no border */
          background: none;
          border: none;
          box-shadow: none;
          overflow: visible;
          padding: 4px 0;
          min-height: 0;
        }

        /*
          D must be a perfect square.
          Its side = width of the right column = (viewport_width - 2*pad - gap) / 2
          We use aspect-ratio and width:100% to enforce this,
          but also cap it so it never overflows.
          flex-shrink:0 prevents it from being squashed.
        */
        .hg-panel-d {
          width: 100%;
          aspect-ratio: 1 / 1;
          flex-shrink: 0;
        }

        /* ─────────────────────────────────────────
           SECTION E  — full-width strip at bottom
        ───────────────────────────────────────── */
        .hg-panel-e {
          flex-shrink: 0;
          height: 88px;
        }

        /* ─────────────────────────────────────────
           SHARED PANEL STYLES  (A, B, D, E)
        ───────────────────────────────────────── */
        .hg-panel {
          position: relative;
          overflow: hidden;
          border: none;
          cursor: pointer;
          padding: 0;
          background: #f5edd6;
          box-shadow: 0 3px 12px rgba(120, 80, 30, 0.15);
          border-radius: var(--radius);
          transition: transform 0.14s ease, filter 0.14s ease;
          display: block;
          width: 100%;
          box-sizing: border-box;
        }
        .hg-panel:active {
          transform: scale(0.97);
          filter: brightness(0.93);
        }

        /* ─── Panel cover image ─── */
        .hg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
        }

        /* Section E: shift photo upward */
        .hg-img-e {
          object-position: center 22%;
        }

        /* ─── Label overlay ─── */
        .hg-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px 11px 8px;
          background: linear-gradient(to top, rgba(45,24,6,0.68) 0%, transparent 100%);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          z-index: 2;
        }
        .hg-label-row {
          flex-direction: row;
          align-items: center;
          gap: 7px;
          padding: 12px 12px 8px;
        }
        .hg-title {
          font-size: 15px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.02em;
          text-shadow: 0 1px 5px rgba(0,0,0,0.45);
          line-height: 1;
        }
        .hg-sub {
          font-size: 9px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.05em;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
          line-height: 1;
        }

        /* ─────────────────────────────────────────
           SECTION C  inner elements
        ───────────────────────────────────────── */

        /* Toast-kun bounces gently left–right */
        @keyframes toastBounce {
          0%   { transform: translateX(0px); }
          50%  { transform: translateX(8px); }
          100% { transform: translateX(0px); }
        }

        .hg-toastkun {
          /* Fill as much of the C cell as possible while staying square */
          width: min(82%, 170px);
          aspect-ratio: 1 / 1;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 3px 10px rgba(180, 110, 40, 0.18));
          animation: toastBounce 2.8s ease-in-out infinite;
          flex-shrink: 0;
        }

        .hg-toast-title {
          font-size: 11px;
          font-weight: 900;
          color: oklch(0.38 0.07 55);
          text-align: center;
          line-height: 1.25;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .hg-toast-bubble {
          position: relative;
          background-color: #fff8e6;
          border: 2px solid #f0d9a6;
          border-radius: 12px;
          padding: 5px 12px;
          font-size: 10px;
          font-weight: 700;
          color: oklch(0.38 0.07 55);
          text-align: center;
          white-space: nowrap;
        }
        /* Tail points upward toward the mascot */
        .hg-toast-bubble::before {
          content: '';
          position: absolute;
          top: -7px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 7px solid #f0d9a6;
        }
        .hg-toast-bubble::after {
          content: '';
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 5px solid #fff8e6;
        }
      `}</style>

      <div className="hg-wrap">

        {/* ── TOP ROW (A+B on left, C+D on right) ── */}
        <div className="hg-top">

          {/* Left column */}
          <div className="hg-left">
            {/* A — 学习 */}
            <button
              className="hg-panel hg-panel-a"
              onClick={() => onNavigate('home')}
              aria-label="学习"
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/learn.png-16IEBGOVfq6TZT8dIkXCVOC82TsiOA.jpeg"
                alt="学习"
                className="hg-img"
              />
              <div className="hg-label">
                <span className="hg-title">学习</span>
                <span className="hg-sub">例句生成</span>
              </div>
            </button>

            {/* B — 讲解 */}
            <button
              className="hg-panel hg-panel-b"
              onClick={() => onNavigate('analysis')}
              aria-label="讲解"
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/explain.png-Toh5YByhsvYWId8DAuqI4qk0f0wu2E.jpeg"
                alt="讲解"
                className="hg-img"
              />
              <div className="hg-label">
                <span className="hg-title">讲解</span>
                <span className="hg-sub">文章讲解</span>
              </div>
            </button>
          </div>

          {/* Right column */}
          <div className="hg-right">
            {/* C — Toast-kun mascot (no frame) */}
            <div className="hg-section-c">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2de86c47-6351-4f01-bf8c-bc347b72c64e-Photoroom-E7NId4cK5MzAOoUTmgJuvZGaEC6ytb.png"
                alt="吐司君"
                className="hg-toastkun"
              />
              <div className="hg-toast-title">吐司君的日语学院</div>
              <div className="hg-toast-bubble">一起学习吧！</div>
            </div>

            {/* D — 测试 (square) */}
            <button
              className="hg-panel hg-panel-d"
              onClick={() => onNavigate('quiz')}
              aria-label="测试"
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test.png-sgmPsRTHpV2l4ICs7nKXY1oa2usbRI.jpeg"
                alt="测试"
                className="hg-img"
              />
              <div className="hg-label">
                <span className="hg-title">测试</span>
                <span className="hg-sub">复习测验</span>
              </div>
            </button>
          </div>
        </div>

        {/* ── E — 收藏 (full-width strip) ── */}
        <button
          className="hg-panel hg-panel-e"
          onClick={() => onNavigate('library')}
          aria-label="收藏"
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/saved.png-zPnsxJofW9lZQ2PhWt2fBmCfqclMve.jpeg"
            alt="收藏"
            className="hg-img hg-img-e"
          />
          <div className="hg-label hg-label-row">
            <span className="hg-title">收藏</span>
            <span className="hg-sub">单字本</span>
          </div>
        </button>

      </div>
    </>
  )
}
