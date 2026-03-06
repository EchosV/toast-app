'use client'

import { useState } from 'react'
import { callGLM } from '@/lib/glm'
import { DIFFICULTIES, THEMES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import ResultCard from '@/components/ui/ResultCard'
import type { SavedItem, Difficulty } from '@/lib/types'

export default function GenerateTab() {
  const [word, setWord] = useState('')
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(['N5'])
  const [selectedThemes, setSelectedThemes] = useState<SavedItem['theme'][]>([])
  const [results, setResults] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [justSavedIds, setJustSavedIds] = useState<Set<string>>(new Set())
  const [hasGenerated, setHasGenerated] = useState(false)

  const toggleDifficulty = (d: Difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(d)
        ? prev.length === 1
          ? prev
          : prev.filter((x) => x !== d)
        : [...prev, d]
    )
  }

  const toggleTheme = (t: SavedItem['theme']) => {
    setSelectedThemes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  const handleGenerate = async () => {
    if (!word.trim()) return

    setLoading(true)
    setResults([])
    setHasGenerated(false)

    try {
      const difficulty = selectedDifficulties
      const theme = selectedThemes

      const levelText = difficulty.join('、')
      const domainText = theme.join('、')

      const prompt = `
你是一位可爱又亲切的日语老师，请根据以下条件生成多个日语例句，并以 JSON 数组格式输出。

【单字】
${word}

【使用者选择的难度】
${levelText || '不限'}

【使用者选择的主题】
${domainText || '不限'}

【难度逻辑】
- 使用者若选择多个难度，请将「最低难度」视为主要难度。
- 主要难度 × 每个主题：请生成 2–3 句例句。
- 若使用者也选择了更高难度，请对每个主题也生成 2–3 句更高难度的例句。
- 最后请额外生成 1 句「更高难度示范句」，难度比使用者最高难度再高一级。

【输出格式】
请务必只输出 JSON 数组，不要加入任何额外说明。
      `

      const raw = await callGLM(prompt)
      const parsed = JSON.parse(raw)
      setResults(parsed)
    } catch (err) {
      console.error('❌ GLM 失败：', err)
      setResults([
        {
          id: 'error',
          word,
          reading: '',
          romaji: '',
          difficulty: '',
          theme: '',
          partOfSpeech: '',
          sentence: '生成失败，请稍后再试。',
          sentenceReading: '',
          translationEn: '',
          translationZh: '',
          explanation: '',
        },
      ])
    }

    setLoading(false)
    setHasGenerated(true)
  }

  const handleSave = (item: SavedItem) => {
    setJustSavedIds((prev) => new Set(prev).add(item.id))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="flex gap-3">
        <input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="输入日语单字，例如：旅行"
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-background"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 active:scale-95"
        >
          {loading ? '生成中…' : '生成'}
        </button>
      </div>

      {/* Difficulty selection */}
      <div className="flex gap-2 flex-wrap">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => toggleDifficulty(d)}
            className={cn(
              'px-3 py-1 rounded-full border text-sm font-medium',
              selectedDifficulties.includes(d)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary text-secondary-foreground border-border'
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Theme selection */}
      <div className="flex gap-2 flex-wrap">
        {THEMES.map((t) => (
          <button
            key={t}
            onClick={() => toggleTheme(t)}
            className={cn(
              'px-3 py-1 rounded-full border text-sm font-medium',
              selectedThemes.includes(t)
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-secondary text-secondary-foreground border-border'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex flex-col gap-4">
        {results.map((item) => (
          <ResultCard
            key={item.id}
            item={item}
            isSaved={justSavedIds.has(item.id)}
            justSaved={justSavedIds.has(item.id)}
            onSave={handleSave}
          />
        ))}

        {hasGenerated && results.length === 0 && (
          <p className="text-center text-muted-foreground">没有生成结果</p>
        )}
      </div>
    </div>
  )
}
