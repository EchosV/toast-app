'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Camera, Mic, ClipboardPaste, FileSearch,
  ChevronDown, ChevronUp, BookmarkPlus, CheckCircle,
  Glasses, Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToastKun } from '@/components/toast-kun-mascot'
import { saveToLibrary, type SavedItem } from '@/lib/types'

interface AnalysisTabProps {
  onSave: (item: SavedItem) => void
  savedIds: Set<string>
}

// ── Mock analysis data ────────────────────────────────────────────────────────

interface AnalysisResult {
  fullTranslation: string
  sentences: { japanese: string; grammar: string; translation: string }[]
  vocabulary: { word: string; reading: string; meaning: string }[]
}

function getMockAnalysis(text: string): AnalysisResult {
  return {
    fullTranslation:
      '（模拟翻译）' + text.slice(0, 40) + (text.length > 40 ? '……' : '') +
      ' — 这段文字描述了一个日常场景，展现了日语语法的丰富表达方式。',
    sentences: [
      {
        japanese: text.split('。')[0] + (text.includes('。') ? '。' : ''),
        grammar: '使用了「〜ています」表示正在进行的动作，以及「が」作为主语助词。',
        translation: '（模拟）这句话描述了一个正在发生的动作或状态。',
      },
      {
        japanese: text.split('。')[1]
          ? (text.split('。')[1] + '。')
          : '毎日日本語を勉強しています。',
        grammar: '「毎日」是频率副词，「〜を勉強する」是"学习某物"的固定搭配。',
        translation: '（模拟）我每天都在学习日语。',
      },
      {
        japanese: text.split('。')[2]
          ? (text.split('。')[2] + '。')
          : 'だんだん上手になってきました。',
        grammar: '「だんだん」表示渐进变化，「〜になってきた」表示逐渐变成某种状态。',
        translation: '（模拟）我的水平正在慢慢提高。',
      },
    ].filter((s) => s.japanese.trim().length > 0),
    vocabulary: [
      { word: '勉強', reading: 'べんきょう', meaning: '学习' },
      { word: '毎日', reading: 'まいにち', meaning: '每天' },
      { word: '上手', reading: 'じょうず', meaning: '擅长、熟练' },
      { word: '日本語', reading: 'にほんご', meaning: '日语' },
      { word: '大切', reading: 'たいせつ', meaning: '重要、珍贵' },
    ],
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SentenceCard({ sentence }: { sentence: AnalysisResult['sentences'][number] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 p-3 text-left hover:bg-secondary/50 transition-colors"
      >
        <p className="text-sm font-bold text-foreground leading-relaxed flex-1">{sentence.japanese}</p>
        {open ? (
          <ChevronUp size={16} className="text-muted-foreground shrink-0 mt-0.5" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-border pt-3">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-1">语法解析</p>
            <p className="text-xs text-foreground leading-relaxed">{sentence.grammar}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-1">翻译</p>
            <p className="text-xs text-foreground leading-relaxed">{sentence.translation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function VocabRow({
  vocab,
  isSaved,
  onSave,
}: {
  vocab: AnalysisResult['vocabulary'][number]
  isSaved: boolean
  onSave: () => void
}) {
  const [justSaved, setJustSaved] = useState(false)

  const handleSave = () => {
    onSave()
    setJustSaved(true)
  }

  const saved = isSaved || justSaved

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
      <div className="flex items-baseline gap-2 flex-1 min-w-0">
        <span className="text-base font-black text-foreground">{vocab.word}</span>
        <span className="text-xs text-muted-foreground font-medium">{vocab.reading}</span>
        <span className="text-xs text-foreground font-medium truncate">{vocab.meaning}</span>
      </div>
      <button
        onClick={handleSave}
        disabled={saved}
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shrink-0',
          saved
            ? 'bg-toast-green/15 text-foreground border border-toast-green/40 cursor-default'
            : 'bg-primary text-primary-foreground hover:brightness-105'
        )}
      >
        {saved ? (
          <><CheckCircle size={12} /> 已保存</>
        ) : (
          <><BookmarkPlus size={12} /> 保存</>
        )}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type InputMode = 'idle' | 'scanning' | 'listening'

export function AnalysisTab({ onSave, savedIds }: AnalysisTabProps) {
  const [inputText, setInputText] = useState('')
  const [inputMode, setInputMode] = useState<InputMode>('idle')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [localSavedWords, setLocalSavedWords] = useState<Set<string>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Toolbar: OCR scan mock
  const handleScan = useCallback(() => {
    setInputMode('scanning')
    setTimeout(() => {
      setInputMode('idle')
      setInputText('駅の近くに新しいカフェができました。毎朝コーヒーを飲みながら本を読むのが楽しみです。')
    }, 2200)
  }, [])

  // Toolbar: Voice input mock
  const handleVoice = useCallback(() => {
    if (inputMode === 'listening') {
      setInputMode('idle')
      return
    }
    setInputMode('listening')
    setTimeout(() => {
      setInputMode('idle')
      setInputText('日本語の勉強は毎日少しずつ続けることが大切です。')
    }, 3000)
  }, [inputMode])

  // Toolbar: Paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      textareaRef.current?.focus()
    } catch {
      textareaRef.current?.focus()
    }
  }, [])

  // Analyse
  const handleAnalyze = useCallback(() => {
    if (!inputText.trim()) return
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      setResult(getMockAnalysis(inputText))
      setLoading(false)
    }, 2000)
  }, [inputText])

  // Save vocab word to library
  const handleSaveVocab = useCallback(
    (vocab: AnalysisResult['vocabulary'][number]) => {
      const item: SavedItem = {
        id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        word: vocab.word,
        reading: vocab.reading,
        romaji: '',
        sentence: '',
        sentenceReading: '',
        translationEn: vocab.meaning,
        translationZh: vocab.meaning,
        explanation: '通过文章讲解提取。',
        partOfSpeech: '',
        difficulty: 'N4',
        theme: 'Daily Life',
        savedAt: Date.now(),
      }
      onSave(item)
      setLocalSavedWords((prev) => new Set(prev).add(vocab.word))
    },
    [onSave]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-foreground">文章讲解</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">粘贴或输入日语文章进行分析</p>
        </div>
        {loading ? (
          <ToastKun size={64} isJumping={false} speechText="分析中…" />
        ) : result ? (
          <ToastKun size={64} isJumping={false} speechText="分析完成！" />
        ) : (
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-toast-brown/10 border border-toast-brown/20">
            <Glasses size={28} className="text-toast-brown" />
          </div>
        )}
      </div>

      {/* Input card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="在此粘贴日语段落或文章…&#10;例：東京は大きな都市です。"
          rows={6}
          className="w-full bg-transparent px-4 pt-4 pb-2 text-sm font-medium text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
        />

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 pb-3 pt-1 border-t border-border">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mr-1 shrink-0">
            输入方式
          </p>

          {/* Scan */}
          <button
            onClick={handleScan}
            disabled={inputMode === 'listening'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95',
              inputMode === 'scanning'
                ? 'bg-primary text-primary-foreground animate-pulse'
                : 'bg-secondary text-foreground border border-border hover:bg-border'
            )}
          >
            <Camera size={13} />
            {inputMode === 'scanning' ? '扫描中…' : '扫描'}
          </button>

          {/* Voice */}
          <button
            onClick={handleVoice}
            disabled={inputMode === 'scanning'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95',
              inputMode === 'listening'
                ? 'bg-accent text-accent-foreground animate-pulse'
                : 'bg-secondary text-foreground border border-border hover:bg-border'
            )}
          >
            <Mic size={13} />
            {inputMode === 'listening' ? '聆听中…' : '语音'}
          </button>

          {/* Paste */}
          <button
            onClick={handlePaste}
            disabled={inputMode !== 'idle'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground border border-border text-xs font-bold hover:bg-border transition-all active:scale-95"
          >
            <ClipboardPaste size={13} />
            粘贴
          </button>

          {/* char count */}
          {inputText.length > 0 && (
            <span className="ml-auto text-[10px] text-muted-foreground font-medium shrink-0">
              {inputText.length} 字
            </span>
          )}
        </div>
      </div>

      {/* Analyse button */}
      <button
        onClick={handleAnalyze}
        disabled={!inputText.trim() || loading || inputMode !== 'idle'}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm transition-all duration-150',
          'bg-toast-brown text-white shadow-sm',
          'hover:brightness-110 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
        )}
      >
        <FileSearch size={16} />
        {loading ? 'AI 分析中…' : '用 AI 分析'}
      </button>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="animate-float">
            <Glasses size={40} className="text-toast-brown" />
          </div>
          <p className="text-sm font-bold text-muted-foreground">吐司君正在阅读…</p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {!loading && result && (
        <div className="flex flex-col gap-4">
          {/* Full translation */}
          <div className="bg-primary/10 border border-primary/25 rounded-2xl p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-2">
              整体翻译
            </p>
            <p className="text-sm text-foreground font-medium leading-relaxed">
              {result.fullTranslation}
            </p>
          </div>

          {/* Sentence breakdown */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">
              逐句解析
            </p>
            {result.sentences.map((s, i) => (
              <SentenceCard key={i} sentence={s} />
            ))}
          </div>

          {/* Extracted vocabulary */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">
              提取词汇
            </p>
            <div className="flex flex-col">
              {result.vocabulary.map((v) => (
                <VocabRow
                  key={v.word}
                  vocab={v}
                  isSaved={savedIds.has(v.word) || localSavedWords.has(v.word)}
                  onSave={() => handleSaveVocab(v)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PWA share hint */}
      <div className="flex items-start gap-3 bg-secondary border border-border rounded-2xl p-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/20 shrink-0">
          <Share2 size={16} className="text-foreground" />
        </div>
        <div>
          <p className="text-xs font-black text-foreground mb-0.5">你知道吗？</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            你可以在任何 App 中选中文字，点击「分享」，然后直接发送给吐司君进行分析！
          </p>
        </div>
      </div>
    </div>
  )
}
