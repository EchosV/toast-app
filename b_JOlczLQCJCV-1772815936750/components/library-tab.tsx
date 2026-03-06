'use client'

import { callGLM } from "@/lib/glm";
import { useState, useRef, useCallback } from 'react'
import {
  Volume2,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  CloudUpload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SavedItem } from '@/lib/types'
import { removeFromLibrary, bulkImportToLibrary } from '@/lib/types'
import { ToastKun } from '@/components/toast-kun-mascot'

interface LibraryTabProps {
  library: SavedItem[]
  onLibraryChange: (items: SavedItem[]) => void
}

// ─── Library Card ────────────────────────────────────────────────────────────

function LibraryCard({ item, onRemove }: { item: SavedItem; onRemove: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

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
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <ruby className="text-2xl font-black text-foreground">
              {item.word}
              {item.reading && <rt className="text-xs font-medium text-muted-foreground">{item.reading}</rt>}
            </ruby>
            <span className="text-xs font-bold bg-primary/20 text-foreground px-2 py-0.5 rounded-full">
              {item.difficulty}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">{item.translationEn}</p>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-muted-foreground shrink-0 ml-2" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-2" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">
          {item.sentence && (
            <div className="bg-secondary rounded-xl p-3 flex flex-col gap-1">
              <p className="text-sm font-bold text-foreground leading-relaxed">{item.sentence}</p>
              {item.sentenceReading && (
                <p className="text-xs text-muted-foreground leading-relaxed">{item.sentenceReading}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <span className="text-xs font-black text-accent-foreground bg-accent rounded-md px-2 py-0.5 shrink-0">EN</span>
              <p className="text-sm text-foreground leading-relaxed">{item.translationEn}</p>
            </div>
            {item.translationZh && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-black text-primary-foreground bg-primary/70 rounded-md px-2 py-0.5 shrink-0">ZH</span>
                <p className="text-sm text-foreground leading-relaxed">{item.translationZh}</p>
              </div>
            )}
          </div>

          {item.explanation && (
            <div className="border-t border-border pt-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">语法备注</p>
              <p className="text-xs text-foreground leading-relaxed">{item.explanation}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {item.sentence && (
              <button
                onClick={() => handlePlayAudio(item.sentence)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm border border-border hover:bg-border transition-all active:scale-95"
              >
                <Volume2 size={14} />
                播放
              </button>
            )}
            <button
              onClick={() => onRemove(item.id)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-destructive/10 text-destructive font-bold text-sm border border-destructive/20 hover:bg-destructive/20 transition-all active:scale-95"
              aria-label={`Remove ${item.word} from library`}
            >
              <Trash2 size={14} />
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Bulk Import Modal ────────────────────────────────────────────────────────

type ImportTab = 'paste' | 'csv'
type ImportStatus = { type: 'success'; added: number } | { type: 'error'; message: string } | null

function BulkImportModal({
  onClose,
  onImported,
}: {
  onClose: () => void
  onImported: (items: SavedItem[]) => void
}) {
  const [activeTab, setActiveTab] = useState<ImportTab>('paste')
  const [pasteText, setPasteText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [csvRows, setCsvRows] = useState<Array<{ word: string; translationEn: string }>>([])
  const [status, setStatus] = useState<ImportStatus>(null)
  const [isJumping, setIsJumping] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse "Japanese, Translation" lines from raw text
  const parseLines = (text: string) =>
    text
      .split('\n')
      .map((line) => {
        const comma = line.indexOf(',')
        if (comma === -1) return null
        return { word: line.slice(0, comma).trim(), translationEn: line.slice(comma + 1).trim() }
      })
      .filter(Boolean) as Array<{ word: string; translationEn: string }>

  const handlePasteImport = () => {
    const entries = parseLines(pasteText)
    if (entries.length === 0) {
      setStatus({ type: 'error', message: '未检测到有效条目，请检查格式。' })
      return
    }
    const { updated, added } = bulkImportToLibrary(entries)
    setIsJumping(true)
    setTimeout(() => setIsJumping(false), 800)
    setStatus({ type: 'success', added })
    onImported(updated)
    setPasteText('')
  }

  const parseCsvText = (text: string) => {
    const rows = text
      .split('\n')
      .map((line) => {
        // Handle quoted CSV and plain CSV
        const parts = line.match(/(".*?"|[^,]+)/g)?.map((p) => p.replace(/^"|"$/g, '').trim()) ?? []
        if (parts.length < 2) return null
        return { word: parts[0], translationEn: parts[1] }
      })
      .filter(Boolean) as Array<{ word: string; translationEn: string }>
    return rows.filter((r) => r.word && r.translationEn)
  }

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setStatus({ type: 'error', message: '请上传 .csv 文件。' })
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCsvText(text)
      setCsvRows(rows)
      setStatus(null)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleCsvImport = () => {
    if (csvRows.length === 0) {
      setStatus({ type: 'error', message: '未检测到有效行，请检查 CSV 格式。' })
      return
    }
    const { updated, added } = bulkImportToLibrary(csvRows)
    setIsJumping(true)
    setTimeout(() => setIsJumping(false), 800)
    setStatus({ type: 'success', added })
    onImported(updated)
    setCsvRows([])
    setFileName(null)
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label="批量导入词汇"
    >
      <div className="w-full max-w-[480px] bg-background rounded-t-3xl border-t border-x border-border shadow-2xl flex flex-col max-h-[90dvh]">

        {/* Modal handle + header */}
        <div className="flex flex-col items-center pt-3 pb-2 px-5">
          <div className="w-10 h-1 rounded-full bg-border mb-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <ToastKun size={52} isJumping={isJumping} speechText={isJumping ? '好吃！' : undefined} />
              <div>
                <h2 className="text-base font-black text-foreground leading-tight">喂吐司君吃词汇</h2>
                <p className="text-xs text-muted-foreground mt-0.5">批量导入到收藏</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="关闭"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 px-5 pb-3">
          <button
            onClick={() => { setActiveTab('paste'); setStatus(null) }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border transition-all',
              activeTab === 'paste'
                ? 'bg-primary/15 border-primary text-foreground'
                : 'bg-secondary border-border text-muted-foreground hover:border-primary/40'
            )}
          >
            <FileText size={14} />
            粘贴文本
          </button>
          <button
            onClick={() => { setActiveTab('csv'); setStatus(null) }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border transition-all',
              activeTab === 'csv'
                ? 'bg-primary/15 border-primary text-foreground'
                : 'bg-secondary border-border text-muted-foreground hover:border-primary/40'
            )}
          >
            <CloudUpload size={14} />
            CSV 上传
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-4">

          {/* ── Option A: Paste ── */}
          {activeTab === 'paste' && (
            <>
              <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3">
                <p className="text-xs font-bold text-foreground mb-1">格式说明</p>
                <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                  日语单词, 翻译<br />
                  （每行一个）
                </p>
                <div className="mt-2 bg-card rounded-xl p-2 border border-border">
                  <p className="text-xs font-mono text-foreground leading-relaxed">
                    猫, cat<br />
                    食べる, to eat<br />
                    学校, school
                  </p>
                </div>
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => { setPasteText(e.target.value); setStatus(null) }}
                placeholder={"猫, cat\n食べる, to eat\n学校, school"}
                rows={8}
                className="w-full bg-input rounded-2xl px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none font-mono leading-relaxed"
              />

              {pasteText.trim() && (
                <p className="text-xs text-muted-foreground -mt-2 px-1">
                  检测到约 {parseLines(pasteText).length} 个条目
                </p>
              )}

              <button
                onClick={handlePasteImport}
                disabled={!pasteText.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={15} />
                添加到收藏
              </button>
            </>
          )}

          {/* ── Option B: CSV ── */}
          {activeTab === 'csv' && (
            <>
              <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3">
                <p className="text-xs font-bold text-foreground mb-1">CSV 格式说明</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  每行两列：<span className="font-mono font-bold text-foreground">日语单词, 翻译</span>。
                  无需表头行。
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-4 text-center cursor-pointer transition-all',
                  isDragging
                    ? 'border-primary bg-primary/10 scale-[1.01]'
                    : 'border-border bg-secondary hover:border-primary/50 hover:bg-primary/5'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-2xl transition-colors',
                  isDragging ? 'bg-primary' : 'bg-card border border-border'
                )}>
                  <CloudUpload size={28} className={isDragging ? 'text-primary-foreground' : 'text-muted-foreground'} />
                </div>
                {fileName ? (
                  <div>
                    <p className="text-sm font-black text-foreground">{fileName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {csvRows.length} 行已解析
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-foreground">拖放 CSV 文件到此处</p>
                    <p className="text-xs text-muted-foreground mt-0.5">或点击选择文件</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                  aria-label="Upload CSV file"
                />
              </div>

              {/* Preview parsed rows */}
              {csvRows.length > 0 && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-border bg-secondary/50">
                    <p className="text-xs font-black text-foreground">预览（前 5 行）</p>
                  </div>
                  <div className="divide-y divide-border">
                    {csvRows.slice(0, 5).map((row, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2">
                        <span className="text-sm font-black text-foreground shrink-0">{row.word}</span>
                        <span className="text-muted-foreground text-xs">→</span>
                        <span className="text-xs text-muted-foreground truncate">{row.translationEn}</span>
                      </div>
                    ))}
                    {csvRows.length > 5 && (
                      <div className="px-3 py-2">
                        <p className="text-xs text-muted-foreground">…还有 {csvRows.length - 5} 行</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleCsvImport}
                disabled={csvRows.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={15} />
                导入 {csvRows.length > 0 ? `${csvRows.length} 个词汇` : ''}
              </button>
            </>
          )}

          {/* Status feedback */}
          {status && (
            <div className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold animate-celebrate-pop',
              status.type === 'success'
                ? 'bg-toast-green/15 border border-toast-green/30 text-foreground'
                : 'bg-destructive/10 border border-destructive/20 text-destructive'
            )}>
              {status.type === 'success' ? (
                <><CheckCircle size={15} className="text-toast-green shrink-0" />
                  成功添加 {status.added} 个新词汇！</>
              ) : (
                <><AlertCircle size={15} className="shrink-0" />
                  {status.message}</>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ─── Library Tab ─────────────────────────────────────────────────────────────

export function LibraryTab({ library, onLibraryChange }: LibraryTabProps) {
  const [showImport, setShowImport] = useState(false)

  const handleRemove = (id: string) => {
    const updated = removeFromLibrary(id)
    onLibraryChange(updated)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-foreground">收藏</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/20 px-3 py-1.5 rounded-full">
          <BookOpen size={14} className="text-foreground" />
          <span className="text-sm font-black text-foreground">{library.length}</span>
          <span className="text-xs text-muted-foreground">词汇</span>
        </div>
      </div>

      {/* Feed Toast-kun button */}
      <button
        onClick={() => setShowImport(true)}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/8 text-foreground font-black text-sm hover:bg-primary/15 hover:border-primary transition-all active:scale-[0.98] animate-bounce-button"
      >
        <CloudUpload size={17} />
        喂吐司君吃词汇（批量导入）
      </button>

      {/* Empty state */}
      {library.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="text-5xl animate-float">📚</div>
          <div>
            <p className="font-black text-foreground text-lg">还没有保存任何词汇！</p>
            <p className="text-sm text-muted-foreground mt-1">
              去学习页面搜索词汇，或使用上方的批量导入功能。
            </p>
          </div>
        </div>
      )}

      {/* Word cards list */}
      <div className="flex flex-col gap-3">
        {library.map((item) => (
          <LibraryCard key={item.id} item={item} onRemove={handleRemove} />
        ))}
      </div>

      {/* Bulk Import Modal */}
      {showImport && (
        <BulkImportModal
          onClose={() => setShowImport(false)}
          onImported={(items) => { onLibraryChange(items); setShowImport(false) }}
        />
      )}
    </div>
  )
}
