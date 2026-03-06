'use client'

import { useState, useCallback } from 'react'
import { Volume2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SavedItem } from '@/lib/types'
import { ToastKun } from '@/components/toast-kun-mascot'

const JAM_COLORS: Array<'strawberry' | 'matcha'> = ['strawberry', 'matcha']
const JAM_NAMES: Record<string, string> = {
  strawberry: '草莓果酱！',
  matcha: '抹茶果酱！',
}

interface QuizQuestion {
  type: 'multiple-choice' | 'listening'
  item: SavedItem
  choices: string[]
  answer: string
}

function buildQuestions(library: SavedItem[]): QuizQuestion[] {
  if (library.length === 0) return []
  const shuffled = [...library].sort(() => Math.random() - 0.5)
  return shuffled.map((item) => {
    const isListening = Math.random() > 0.5 && library.length >= 2
    const others = library.filter((i) => i.word !== item.word)
    const distractors = [...others].sort(() => Math.random() - 0.5).slice(0, 3)

    if (isListening && distractors.length >= 2) {
      // Listening: audio plays, pick the correct word
      const wordChoices = [item.word, ...distractors.map((d) => d.word)].sort(() => Math.random() - 0.5)
      return {
        type: 'listening' as const,
        item,
        choices: wordChoices,
        answer: item.word,
      }
    } else {
      // Multiple choice: given translation, pick the Japanese
      const choiceTranslations = [item.translationEn, ...distractors.map((d) => d.translationEn)].sort(
        () => Math.random() - 0.5
      )
      return {
        type: 'multiple-choice' as const,
        item,
        choices: choiceTranslations,
        answer: item.translationEn,
      }
    }
  })
}

interface QuizTabProps {
  library: SavedItem[]
}

export function QuizTab({ library }: QuizTabProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildQuestions(library))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [jamProgress, setJamProgress] = useState(0)
  const [isJammy, setIsJammy] = useState(false)
  const [jamColor, setJamColor] = useState<'strawberry' | 'matcha'>('strawberry')
  const [showCelebration, setShowCelebration] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const [score, setScore] = useState(0)

  const currentQ = questions[currentIdx]

  const handlePlayAudio = useCallback((text: string) => {
    // Web Speech API SpeechSynthesis will be called here
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.85
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const handleSelect = (choice: string) => {
    if (selected !== null) return
    setSelected(choice)

    const correct = choice === currentQ.answer
    if (correct) {
      setScore((s) => s + 1)
      const newProgress = Math.min(jamProgress + Math.ceil(100 / questions.length), 100)
      setJamProgress(newProgress)

      if (newProgress >= 100) {
        const color = JAM_COLORS[Math.floor(Math.random() * JAM_COLORS.length)]
        setJamColor(color)
        setIsJammy(true)
        setShowCelebration(true)
        setTimeout(() => {
          setIsJammy(false)
          setShowCelebration(false)
        }, 3000)
      }
    }
  }

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setQuizDone(true)
    } else {
      setCurrentIdx((i) => i + 1)
      setSelected(null)
    }
  }

  const handleRestart = () => {
    setQuestions(buildQuestions(library))
    setCurrentIdx(0)
    setSelected(null)
    setJamProgress(0)
    setIsJammy(false)
    setShowCelebration(false)
    setQuizDone(false)
    setScore(0)
  }

  const progressPercent = questions.length > 0 ? Math.round((currentIdx / questions.length) * 100) : 0

  if (library.length < 2) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-foreground">测验&果酱</h2>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="text-5xl animate-float">🍓</div>
          <div>
            <p className="font-black text-foreground text-lg">需要更多词汇！</p>
            <p className="text-sm text-muted-foreground mt-1">
              保存至少 2 个词汇到你的库中才能开始测验。
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-foreground">测试</h2>
        </div>
        <ToastKun
          isJumping={isJammy}
          isJammy={isJammy}
          jamColor={jamColor}
          size={60}
          speechText={showCelebration ? JAM_NAMES[jamColor] : undefined}
        />
      </div>

      {/* Jam progress bar */}
      <div className="bg-card rounded-2xl border border-border p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-foreground">果酱进度</span>
          <span className="text-xs font-bold text-muted-foreground">{jamProgress}%</span>
        </div>
        <div className="h-4 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              jamColor === 'matcha' ? 'bg-toast-green' : 'bg-toast-red'
            )}
            style={{ width: `${jamProgress}%` }}
            role="progressbar"
            aria-valuenow={jamProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Jam progress"
          />
        </div>
        {showCelebration && (
          <p className="text-center text-xs font-black text-foreground mt-2 animate-celebrate-pop">
            {jamColor === 'strawberry' ? '草莓果酱' : '抹茶果酱'} - 烤面包君被覆盖了！
          </p>
        )}
      </div>

      {/* Quiz done screen */}
      {quizDone && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center gap-4 text-center animate-celebrate-pop">
          <div className="text-5xl animate-float">🎉</div>
          <div>
            <p className="text-2xl font-black text-foreground">测验完成！</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-foreground">{score}</span>
              <span className="text-xs text-muted-foreground">正确</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-foreground">{questions.length}</span>
              <span className="text-xs text-muted-foreground">总题数</span>
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <RefreshCw size={15} />
            再来一次
          </button>
        </div>
      )}

      {/* Active question */}
      {!quizDone && currentQ && (
        <>
          {/* Question progress */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground shrink-0">
              {currentIdx + 1}/{questions.length}
            </span>
          </div>

          {/* Question card */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col gap-4">
            {/* Question type badge */}
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs font-black px-3 py-1 rounded-full',
                currentQ.type === 'listening'
                  ? 'bg-accent/20 text-foreground border border-accent/30'
                  : 'bg-primary/20 text-foreground border border-primary/30'
              )}>
                {currentQ.type === 'listening' ? '听力' : '选择题'}
              </span>
            </div>

            {/* Listening question */}
            {currentQ.type === 'listening' && (
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="text-sm font-bold text-foreground text-center">
                  听音频并选择正确的单词。
                </p>
                <button
                  onClick={() => handlePlayAudio(currentQ.item.sentence)}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:brightness-105 active:scale-95 transition-all animate-bounce-button"
                >
                  <Volume2 size={16} />
                  播放音频
                </button>
              </div>
            )}

            {/* Multiple choice question */}
            {currentQ.type === 'multiple-choice' && (
              <div className="flex flex-col items-center gap-2 py-2">
                <p className="text-sm font-bold text-muted-foreground">选择日语：</p>
                <div className="text-center bg-secondary rounded-xl px-4 py-3 w-full">
                  <p className="text-base font-bold text-foreground leading-relaxed">{currentQ.item.translationEn}</p>
                </div>
              </div>
            )}

            {/* Choices */}
            <div className="flex flex-col gap-2">
              {currentQ.choices.map((choice) => {
                const isSelected = selected === choice
                const isCorrect = choice === currentQ.answer
                const showResult = selected !== null

                return (
                  <button
                    key={choice}
                    onClick={() => handleSelect(choice)}
                    disabled={selected !== null}
                    className={cn(
                      'w-full text-left py-3 px-4 rounded-xl font-bold text-sm transition-all duration-150 border',
                      'flex items-center justify-between gap-2',
                      !showResult
                        ? 'bg-secondary text-foreground border-border hover:bg-border active:scale-95 cursor-pointer'
                        : isCorrect
                        ? 'bg-toast-green/20 text-foreground border-toast-green/50'
                        : isSelected
                        ? 'bg-toast-red/20 text-foreground border-toast-red/40'
                        : 'bg-secondary text-muted-foreground border-border opacity-60'
                    )}
                  >
                    <span className="leading-relaxed">{choice}</span>
                    {showResult && isCorrect && <CheckCircle size={16} className="text-toast-green shrink-0" />}
                    {showResult && isSelected && !isCorrect && <XCircle size={16} className="text-toast-red shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Feedback + next */}
            {selected !== null && (
              <div className="flex flex-col gap-3 border-t border-border pt-3 animate-celebrate-pop">
                <div className={cn(
                  'flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-bold',
                  selected === currentQ.answer
                    ? 'bg-toast-green/15 text-foreground'
                    : 'bg-toast-red/15 text-foreground'
                )}>
                  {selected === currentQ.answer ? (
                    <><CheckCircle size={15} className="text-toast-green" /> 正确！</>
                  ) : (
                    <><XCircle size={15} className="text-toast-red" /> 答案是：{currentQ.answer}</>
                  )}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:brightness-105 active:scale-95 transition-all"
                >
                  {currentIdx + 1 >= questions.length ? '查看结果' : '下一题 →'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
