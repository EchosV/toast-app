'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { BottomNav, type TabName } from '../components/bottom-nav'
import { HomeTab } from '../components/home-tab'
import { GenerateTab } from '../components/generate-tab'
import { LibraryTab } from '../components/library-tab'
import { QuizTab } from '../components/quiz-tab'
import { AnalysisTab } from '../components/analysis-tab'
import { loadLibrary, saveToLibrary, type SavedItem } from '@/lib/types'

// View includes all nav tabs + an inner 'generate' view reachable from Home
type View = TabName | 'generate'

export default function Home() {
  const [view, setView] = useState<View>('home')
  const [library, setLibrary] = useState<SavedItem[]>([])
  const [toastJumping, setToastJumping] = useState(false)

  useEffect(() => {
    setLibrary(loadLibrary())
  }, [])

  const handleSave = useCallback((item: SavedItem) => {
    const updated = saveToLibrary(item)
    setLibrary(updated)
  }, [])

  const handleToastJump = useCallback(() => {
    setToastJumping(true)
    setTimeout(() => setToastJumping(false), 800)
  }, [])

  const handleLibraryChange = useCallback((items: SavedItem[]) => {
    setLibrary(items)
  }, [])

  // Home entry card "Generate & Learn" navigates to the generate view
  // Home entry card "讲解" navigates to the analysis view
  const handleHomeNavigate = (tab: TabName) => {
    if (tab === 'home') {
      setView('generate')
    } else {
      setView(tab)
    }
  }

  // Bottom nav tapping Home always goes back to the home dashboard
  const handleTabChange = (tab: TabName) => {
    setView(tab)
  }

  // For the bottom nav active highlight: treat 'generate' as 'home'
  const activeNavTab: TabName = view === 'generate' ? 'home' : (view as TabName)
  const savedWordSet = new Set(library.map((i) => i.word))

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen flex flex-col bg-background">
        <main className={cn(
          'flex-1 overflow-y-auto',
          view === 'home' ? 'overflow-hidden pb-0' : 'pt-4 px-4 pb-[64px]'
        )}>
          {view === 'home' && (
            <HomeTab onNavigate={handleHomeNavigate} libraryCount={library.length} />
          )}
          {view === 'generate' && (
            <GenerateTab
              onSave={handleSave}
              savedIds={savedWordSet}
              onToastJump={handleToastJump}
              isJumping={toastJumping}
            />
          )}
          {view === 'library' && (
            <LibraryTab library={library} onLibraryChange={handleLibraryChange} />
          )}
          {view === 'quiz' && (
            <QuizTab library={library} />
          )}
          {view === 'analysis' && (
            <AnalysisTab onSave={handleSave} savedIds={savedWordSet} />
          )}
        </main>

        <BottomNav activeTab={activeNavTab} onTabChange={handleTabChange} />
      </div>
    </div>
  )
}
