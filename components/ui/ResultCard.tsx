'use client'

import { Volume2, BookmarkPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SavedItem } from '@/lib/types'

export default function ResultCard({
  item,
  isSaved,
  onSave,
  justSaved,
}: {
  item: SavedItem
  isSaved: boolean
  onSave: (item: SavedItem) => void
  justSaved: boolean
}) {
  const handlePlayAudio = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.85
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col gap-4 animate-celebrate-pop">
      {/* Badges */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs font-bold bg-primary/20 text-foreground px-3 py-1 rounded-full border border-primary/30">
          {item.difficulty}
        </span>
        <span className="text-xs font-bold bg-accent/20 text-foreground px-3 py-1 rounded-full border border-accent/30">
          {item.theme}
        </span>
        <span className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
          {item.partOfSpeech}
        </span>
      </div>

      {/* Main word */}
      <div className="text-center py-1">
        <ruby className="text-4xl font-black text-foreground">
          {item.word}
          <rt className="text-sm font-medium text-muted-foreground">{item.reading}</rt>
        </ruby>
        <p className="text-sm text-muted-foreground font-medium mt-1">{item.romaji}</p>
      </div>

      {/* Example sentence */}
      <div className="bg-secondary rounded-xl p-3 flex flex-col gap-1">
        <p className="text-sm font-bold text-foreground leading-relaxed">{item.sentence}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{item.sentenceReading}</p>
      </div>

      {/* Translations */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <span className="text-xs font-black text-accent-foreground bg-accent rounded-md px-2 py-0.5 shrink-0">EN</span>
          <p className="text-sm text-foreground leading-relaxed">{item.translationEn}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xs font-black text-primary-foreground bg-primary/70 rounded-md px-2 py-0.5 shrink-0">ZH</span>
          <p className="text-sm text-foreground leading-relaxed">{item.translationZh}</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="border-t border-border pt-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">语法备注</p>
        <p className="text-sm text-foreground leading-relaxed">{item.explanation}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => handlePlayAudio(item.sentence)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm border border-border hover:bg-border transition-all active:scale-95"
        >
          <Volume2 size={15} />
          播放音频
        </button>

        <button
          onClick={() => onSave({ ...item, savedAt: Date.now() })}
          disabled={isSaved}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all active:scale-95',
            isSaved || justSaved
              ? 'bg-toast-green/20 text-foreground border border-toast-green/40 cursor-default'
              : 'bg-accent text-accent-foreground hover:brightness-105'
          )}
        >
          <BookmarkPlus size={15} />
          {isSaved || justSaved ? '已保存!' : '保存'}
        </button>
      </div>
    </div>
  )
}
