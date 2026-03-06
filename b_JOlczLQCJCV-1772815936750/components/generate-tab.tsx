'use client'

import { useState } from 'react'
import { callGLM } from "@/lib/glm"
import { Sparkles, Volume2, BookmarkPlus, Home, Plane, Heart, GraduationCap, Gamepad2, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import ResultCard from './ResultCard'
import { DIFFICULTIES, THEMES } from '@/lib/constants'
import { ToastKun } from '@/components/toast-kun-mascot'
import type { SavedItem } from '@/lib/types'

export default function GenerateTab() {
  const [word, setWord] = useState("")
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)



  // ─── Mock data bank ────────────────────────────────────────────────────────────

  const MOCK_BANK: SavedItem[] = [
    {
      id: '', word: '旅行', reading: 'りょこう', romaji: 'ryokō',
      sentence: '来年、日本に旅行したいと思っています。',
      sentenceReading: 'らいねん、にほんに りょこうしたいと おもっています。',
      translationEn: "I'm thinking I'd like to travel to Japan next year.",
      translationZh: '我在想明年想去日本旅行。',
      explanation: '旅行 (ryokō) is a noun meaning "travel." Combines 旅 (journey) + 行 (go). Pair with する → 旅行する (to travel). Common: 海外旅行 (overseas travel).',
      partOfSpeech: 'Noun / Verb stem', difficulty: 'N5', theme: 'Travel', savedAt: 0,
    },
    {
      id: '', word: '電車', reading: 'でんしゃ', romaji: 'densha',
      sentence: '毎日電車で学校に通っています。',
      sentenceReading: 'まいにち でんしゃで がっこうに かよっています。',
      translationEn: 'I commute to school by train every day.',
      translationZh: '我每天坐电车去上学。',
      explanation: '電車 (densha) means "electric train." 電 = electricity, 車 = vehicle. Very common in daily Japanese life. Contrast with バス (bus) and 地下鉄 (subway).',
      partOfSpeech: 'Noun', difficulty: 'N5', theme: 'Daily Life', savedAt: 0,
    },
    {
      id: '', word: 'ドキドキ', reading: 'どきどき', romaji: 'dokidoki',
      sentence: '彼女のことを考えるとドキドキします。',
      sentenceReading: 'かのじょのことを かんがえると どきどきします。',
      translationEn: 'My heart pounds when I think about her.',
      translationZh: '一想到她，我的心就扑通扑通地跳。',
      explanation: 'ドキドキ is onomatopoeia (擬態語) for a racing heartbeat — excitement or nervousness. Usage: ドキドキする (to feel one\'s heart pounding).',
      partOfSpeech: 'Onomatopoeia / Adverb', difficulty: 'N4', theme: 'Romance', savedAt: 0,
    },
    {
      id: '', word: '承知しました', reading: 'しょうちしました', romaji: 'shōchi shimashita',
      sentence: '会議の日程について、承知しました。',
      sentenceReading: 'かいぎの にっていについて、しょうちしました。',
      translationEn: 'Understood, regarding the meeting schedule.',
      translationZh: '关于会议日程，我明白了。',
      explanation: '承知しました is formal keigo meaning "I understand / Understood." More polite than わかりました. Essential in business emails and meetings.',
      partOfSpeech: 'Set phrase (keigo)', difficulty: 'N3', theme: 'Business', savedAt: 0,
    },
    {
      id: '', word: '勉強する', reading: 'べんきょうする', romaji: 'benkyō suru',
      sentence: '毎晩二時間日本語を勉強しています。',
      sentenceReading: 'まいばん にじかん にほんごを べんきょうしています。',
      translationEn: 'I study Japanese for two hours every night.',
      translationZh: '我每晚学习两个小时日语。',
      explanation: '勉強する (benkyō suru) means "to study." 勉強 is a noun (study/effort) combined with する. Common compound: 勉強になる (to be educational/informative).',
      partOfSpeech: 'Verb (する-verb)', difficulty: 'N5', theme: 'Study', savedAt: 0,
    },
    {
      id: '', word: 'アップデート', reading: 'アップデート', romaji: 'appudēto',
      sentence: 'このアプリのアップデートをしてください。',
      sentenceReading: 'この アプリの アップデートを してください。',
      translationEn: 'Please update this app.',
      translationZh: '请更新这个应用程序。',
      explanation: 'アップデート is a katakana loanword from English "update." Common in tech. Used as: アップデートする (to update). Related: バージョンアップ (version upgrade).',
      partOfSpeech: 'Noun / Verb stem', difficulty: 'N3', theme: 'Entertainment', savedAt: 0,
    },
    {
      id: '', word: '気持ち', reading: 'きもち', romaji: 'kimochi',
      sentence: 'あなたの気持ちがよくわかります。',
      sentenceReading: 'あなたの きもちが よくわかります。',
      translationEn: 'I understand your feelings very well.',
      translationZh: '我非常理解你的感受。',
      explanation: '気持ち (kimochi) means "feeling" or "emotion." 気 = spirit/energy, 持ち = holding. The famous 気持ちいい means "feels good." Extremely common in everyday speech.',
      partOfSpeech: 'Noun', difficulty: 'N4', theme: 'Daily Life', savedAt: 0,
    },
    {
      id: '', word: '飛行機', reading: 'ひこうき', romaji: 'hikōki',
      sentence: '飛行機に乗るのは初めてです。',
      sentenceReading: 'ひこうきに のるのは はじめてです。',
      translationEn: 'This is my first time riding an airplane.',
      translationZh: '这是我第一次坐飞机。',
      explanation: '飛行機 (hikōki) means "airplane." 飛 = fly, 行 = go, 機 = machine. Contrast with 新幹線 (shinkansen, bullet train) for domestic travel.',
      partOfSpeech: 'Noun', difficulty: 'N5', theme: 'Travel', savedAt: 0,
    },
    {
      id: '', word: '相談する', reading: 'そうだんする', romaji: 'sōdan suru',
      sentence: '困ったときはいつでも相談してください。',
      sentenceReading: 'こまったときは いつでも そうだんしてください。',
      translationEn: 'Please consult me anytime you are in trouble.',
      translationZh: '遇到困难时请随时找我商量。',
      explanation: '相談する (sōdan suru) means "to consult" or "to discuss." Used when seeking advice. Noun form 相談 alone means "consultation/discussion." Very common in both formal and casual settings.',
      partOfSpeech: 'Verb (する-verb)', difficulty: 'N4', theme: 'Business', savedAt: 0,
    },
    {
      id: '', word: '夢中', reading: 'むちゅう', romaji: 'muchū',
      sentence: '最近アニメに夢中になっています。',
      sentenceReading: 'さいきん アニメに むちゅうに なっています。',
      translationEn: 'I have been completely absorbed in anime lately.',
      translationZh: '最近我完全沉迷于动漫了。',
      explanation: '夢中 (muchū) means "absorbed in" or "crazy about." Literally "inside a dream." Used as: 〜に夢中になる (to become absorbed in something). Strong, positive obsession.',
      partOfSpeech: 'Na-adjective / Noun', difficulty: 'N3', theme: 'Entertainment', savedAt: 0,
    },
  ]

  function pickResults(difficulties: Difficulty[], themes: SavedItem['theme'][], count: number): SavedItem[] {
    const pool = MOCK_BANK.filter(
      (item) =>
        (difficulties.length === 0 || difficulties.includes(item.difficulty as Difficulty)) &&
        (themes.length === 0 || themes.includes(item.theme))
    )
    const source = pool.length > 0 ? pool : MOCK_BANK
    const shuffled = [...source].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map((item, i) => ({
      ...item,
      id: `${Date.now()}-${i}`,
    }))
  }

  // ─── Result Card ───────────────────────────────────────────────────────────────

  function ResultCard({
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
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm border border-border hover:bg-border transition-all active:scale-95 animate-bounce-button"
          >
            <Volume2 size={15} />
            播放音频
          </button>
          <button
            onClick={() => onSave({ ...item, savedAt: Date.now() })}
            disabled={isSaved}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 animate-bounce-button',
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

  // ─── Main component ────────────────────────────────────────────────────────────



  const [word, setWord] = useState('')
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(['N5'])
  const [selectedThemes, setSelectedThemes] = useState<SavedItem['theme'][]>([])
  const [results, setResults] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [justSavedIds, setJustSavedIds] = useState<Set<string>>(new Set())
  const [hasGenerated, setHasGenerated] = useState(false)

  const toggleDifficulty = (d: Difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(d) ? (prev.length === 1 ? prev : prev.filter((x) => x !== d)) : [...prev, d]
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

      const levelText = difficulty.join("、")
      const domainText = theme.join("、")

      const prompt = `
你是一位可爱又亲切的日语老师，请根据以下条件生成多个日语例句，并以 JSON 数组格式输出。

【单字】
${word}

【使用者选择的难度】
${levelText || "不限"}

【使用者选择的主题】
${domainText || "不限"}

【难度逻辑】
- 使用者若选择多个难度，请将「最低难度」视为主要难度。
- 主要难度 × 每个主题：请生成 2–3 句例句。
- 若使用者也选择了更高难度，请对每个主题也生成 2–3 句更高难度的例句。
- 最后请额外生成 1 句「更高难度示范句」，难度比使用者最高难度再高一级（例如最高选 N4 → 示范句用 N3）。
- 示范句不需要主题（theme 可留空）。

【主题逻辑】
- 使用者若选择多个主题，请确保每个主题都至少有 2 句例句。
- 每句例句必须明确对应到该主题（例如：旅行、日常生活、购物等）。

【输出格式】
请输出一个 JSON 数组，每个元素为一个 SavedItem，格式如下：

{
  "id": "glm-编号",
  "word": "${word}",
  "reading": "假名",
  "romaji": "罗马音",
  "difficulty": "N5 / N4 / N3 / N2 / N1",
  "theme": "主题名称（示范句可为空）",
  "partOfSpeech": "词性",
  "sentence": "日文例句",
  "sentenceReading": "例句假名",
  "translationEn": "英文翻译",
  "translationZh": "中文翻译",
  "explanation": "语法或用法说明"
}

请务必只输出 JSON 数组，不要加入任何额外说明。
    `

      const raw = await callGLM(prompt)

      // GLM 回傳的是陣列
      const parsed = JSON.parse(raw)

      // 直接塞進 results → UI 自動顯示多張卡片
      setResults(parsed)
    } catch (err) {
      console.error("❌ GLM 失敗：", err)
      setResults([
        {
          id: "error",
          word,
          reading: "",
          romaji: "",
          difficulty: "",
          theme: "",
          partOfSpeech: "",
          sentence: "生成失敗，請稍後再試。",
          sentenceReading: "",
          translationEn: "",
          translationZh: "",
          explanation: "",
        },
      ])
    }

    setLoading(false)
    setHasGenerated(true)
  }
  return (
    <div></div>
  )
}