'use client'

import { cn } from '@/lib/utils'
import { Home, BookOpen, Brain, FileSearch, Settings } from 'lucide-react'

export type TabName = 'home' | 'library' | 'quiz' | 'analysis' | 'settings'

interface BottomNavProps {
  activeTab: TabName
  onTabChange: (tab: TabName) => void
}

// Order: Library | Explain | HOME (center) | Test | Settings
const tabs: { id: TabName; label: string; icon: React.ElementType; isCenter?: boolean }[] = [
  { id: 'library', label: '收藏', icon: BookOpen },
  { id: 'analysis', label: '讲解', icon: FileSearch },
  { id: 'home', label: '首页', icon: Home, isCenter: true },
  { id: 'quiz', label: '测试', icon: Brain },
  { id: 'settings', label: '设置', icon: Settings },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-toast-nav border-t border-border shadow-lg z-50"
    >
      <div className="flex items-center justify-around px-1 py-0.5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${label} tab`}
              className={cn(
                'flex flex-col items-center gap-0.5 flex-1 cursor-pointer transition-all duration-200 active:scale-95 py-1'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
                  isActive ? 'bg-primary shadow-sm' : ''
                )}
              >
                <Icon
                  size={16}
                  className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                'text-[12px] font-bold leading-none text-center',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
