export interface SavedItem {
  id: string
  word: string
  reading: string
  romaji: string
  sentence: string
  sentenceReading: string
  translationEn: string
  translationZh: string
  explanation: string
  partOfSpeech: string
  difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  theme: 'Daily Life' | 'Travel' | 'Romance' | 'Study' | 'Entertainment' | 'Business' | 'Food' | 'Tech'
  savedAt: number
}

const STORAGE_KEY = 'toastkun_library'

export function loadLibrary(): SavedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToLibrary(item: SavedItem): SavedItem[] {
  const library = loadLibrary()
  // avoid duplicates by word
  const exists = library.some((i) => i.word === item.word)
  if (exists) return library
  const updated = [item, ...library]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function removeFromLibrary(id: string): SavedItem[] {
  const library = loadLibrary().filter((i) => i.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
  return library
}

/** Bulk-import a list of {word, translationEn} pairs, skipping duplicates by word. */
export function bulkImportToLibrary(
  entries: Array<{ word: string; translationEn: string }>
): { updated: SavedItem[]; added: number } {
  const library = loadLibrary()
  const existingWords = new Set(library.map((i) => i.word))
  let added = 0
  const newItems: SavedItem[] = []

  for (const { word, translationEn } of entries) {
    const trimmedWord = word.trim()
    const trimmedTrans = translationEn.trim()
    if (!trimmedWord || !trimmedTrans) continue
    if (existingWords.has(trimmedWord)) continue
    existingWords.add(trimmedWord)
    added++
    newItems.push({
      id: `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      word: trimmedWord,
      reading: '',
      romaji: '',
      sentence: '',
      sentenceReading: '',
      translationEn: trimmedTrans,
      translationZh: '',
      explanation: '通过批量导入添加。',
      partOfSpeech: '',
      difficulty: 'N5',
      theme: 'Daily Life',
      savedAt: Date.now(),
    })
  }

  const updated = [...newItems, ...library]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return { updated, added }
}
