const LAYOUTS: Record<string, number[][]> = {
  '기본':   [[0, 1], [2, 3, 4]],
  '밸런스': [[0, 1, 2], [3, 4]],
  '공격':   [[0], [1, 2, 3, 4]],
  '보호':   [[0, 1, 2, 3], [4]],
}

function detectType(text: string): string | null {
  if (text.startsWith('기본'))   return '기본'
  if (text.startsWith('밸런스')) return '밸런스'
  if (text.startsWith('공격'))   return '공격'
  if (text.startsWith('보호'))   return '보호'
  return null
}

export function FormationGrid({ text }: { text: string }) {
  if (!text || text === '-') return <span className="text-slate-500 text-sm">-</span>
  const type = detectType(text.trim())
  if (!type) return <span className="text-slate-400 text-sm whitespace-pre-wrap">{text}</span>

  const layout = LAYOUTS[type]
  const cleaned = text.replace(type, '').trim()
  const chars = cleaned ? cleaned.split(/\s+/).map(c => (c === '_' ? '' : c)) : []

  return (
    <div className="flex flex-col gap-1.5">
      {layout.map((row, rowIdx) => (
        <div key={rowIdx} className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-slate-500 font-bold tracking-wide">
            {rowIdx === 0 ? '▲ 앞줄' : '▼ 뒷줄'}
          </span>
          <div className="flex gap-1">
            {row.map(idx => (
              <div
                key={idx}
                className="px-2 py-1 rounded-md bg-[#16163a] border border-amber-900/20 text-xs text-slate-300 font-medium min-w-[52px] text-center"
              >
                {chars[idx] || <span className="text-slate-600">?</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-slate-600 text-center mt-0.5">{type} 진형</p>
    </div>
  )
}
