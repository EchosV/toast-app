'use client'

import { cn } from '@/lib/utils'

interface ToastKunProps {
  isJumping?: boolean
  isJammy?: boolean
  jamColor?: 'strawberry' | 'matcha'
  size?: number
  speechText?: string
  className?: string
}

export function ToastKun({
  isJumping = false,
  isJammy = false,
  jamColor = 'strawberry',
  size = 80,
  speechText = '頑張って！',
  className,
}: ToastKunProps) {
  const jamFill = jamColor === 'strawberry' ? '#e05a6a' : '#6dab6d'
  const jamFill2 = jamColor === 'strawberry' ? '#f07080' : '#84c784'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Toast-kun SVG */}
      <div
        className={cn(
          'relative transition-all duration-100',
          isJumping && 'animate-toast-jump',
          isJammy && 'animate-toast-jam'
        )}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 110"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Toast-kun mascot"
          role="img"
        >
          {/* Shadow */}
          <ellipse cx="50" cy="108" rx="22" ry="5" fill="rgba(0,0,0,0.08)" />

          {/* Toast body */}
          <rect x="16" y="18" width="68" height="76" rx="14" ry="14" fill="#e8b96a" />
          {/* Toast crust top */}
          <rect x="16" y="18" width="68" height="22" rx="14" ry="14" fill="#c8853a" />
          {/* Toast crust bottom curve fix */}
          <rect x="16" y="30" width="68" height="10" fill="#c8853a" />

          {/* Toast face area (lighter inner) */}
          <rect x="22" y="42" width="56" height="46" rx="8" ry="8" fill="#f5cc7f" />

          {/* Jam spread (visible when jammy) */}
          {isJammy && (
            <>
              <ellipse cx="38" cy="34" rx="10" ry="6" fill={jamFill} opacity="0.9" className="animate-jam-splat" />
              <ellipse cx="58" cy="28" rx="7" ry="5" fill={jamFill2} opacity="0.85" className="animate-jam-splat" style={{ animationDelay: '0.1s' }} />
              <ellipse cx="70" cy="38" rx="8" ry="5" fill={jamFill} opacity="0.8" className="animate-jam-splat" style={{ animationDelay: '0.2s' }} />
              <circle cx="30" cy="45" r="4" fill={jamFill2} opacity="0.75" className="animate-jam-splat" style={{ animationDelay: '0.15s' }} />
            </>
          )}

          {/* Eyes */}
          <ellipse cx="40" cy="56" rx="6" ry="7" fill="white" />
          <ellipse cx="60" cy="56" rx="6" ry="7" fill="white" />
          <circle cx="41.5" cy="57" r="4" fill="#3d2a0f" />
          <circle cx="61.5" cy="57" r="4" fill="#3d2a0f" />
          {/* Eye shine */}
          <circle cx="43" cy="55" r="1.5" fill="white" />
          <circle cx="63" cy="55" r="1.5" fill="white" />

          {/* Rosy cheeks */}
          <ellipse cx="34" cy="67" rx="7" ry="4" fill="#f0917b" opacity="0.5" />
          <ellipse cx="66" cy="67" rx="7" ry="4" fill="#f0917b" opacity="0.5" />

          {/* Smile */}
          <path d="M 40 72 Q 50 80 60 72" stroke="#3d2a0f" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Arms */}
          <rect x="4" y="50" width="14" height="8" rx="4" fill="#e8b96a" />
          <rect x="82" y="50" width="14" height="8" rx="4" fill="#e8b96a" />

          {/* Legs */}
          <rect x="32" y="92" width="14" height="12" rx="6" fill="#c8853a" />
          <rect x="54" y="92" width="14" height="12" rx="6" fill="#c8853a" />
        </svg>
      </div>

      {/* Speech bubble */}
      {speechText && (
        <div className="relative">
          <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
            <p className="text-sm font-bold text-foreground whitespace-nowrap">{speechText}</p>
          </div>
          {/* Bubble tail */}
          <div
            className="absolute left-[-6px] bottom-2 w-0 h-0"
            style={{
              borderTop: '6px solid transparent',
              borderRight: '8px solid var(--border)',
              borderBottom: '0',
            }}
          />
          <div
            className="absolute left-[-4px] bottom-2 w-0 h-0"
            style={{
              borderTop: '6px solid transparent',
              borderRight: '8px solid var(--card)',
              borderBottom: '0',
            }}
          />
        </div>
      )}
    </div>
  )
}
