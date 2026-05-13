import { getSpecies } from '../utils/birdData'

export function ResultCard({ result }) {
  if (!result) return null

  const { topPrediction, topK, detected, isMock } = result
  const species = getSpecies(detected ? topPrediction.label : 'nocdet')

  return (
    <div
      className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden"
      style={{ animation: 'slide-up 0.4s ease-out', background: 'rgba(26, 58, 42, 0.8)', border: '1px solid rgba(76, 175, 125, 0.2)' }}
    >
      {/* Header band */}
      <div
        className="px-5 py-3 flex items-center gap-3"
        style={{ background: detected ? 'rgba(76, 175, 125, 0.15)' : 'rgba(100, 100, 100, 0.15)' }}
      >
        <div className="text-2xl">{detected ? '🐦' : '🔇'}</div>
        <div>
          <div className="font-semibold text-base leading-tight" style={{ color: 'var(--cream)' }}>
            {species.common}
          </div>
          {species.scientific && (
            <div className="text-xs italic" style={{ color: 'var(--mist)' }}>
              {species.scientific}
            </div>
          )}
        </div>
        {detected && (
          <div className="ml-auto text-right">
            <div
              className="text-lg font-bold"
              style={{ color: confidenceColor(topPrediction.confidence) }}
            >
              {Math.round(topPrediction.confidence * 100)}%
            </div>
            <div className="text-xs" style={{ color: 'var(--mist)' }}>confidence</div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--mist)' }}>
          {species.desc}
        </p>
      </div>

      {/* Top-3 alternatives */}
      {detected && topK.length > 1 && (
        <div className="px-5 pb-4">
          <div className="text-xs mb-2 font-medium" style={{ color: 'var(--leaf)' }}>
            Other possibilities
          </div>
          <div className="flex flex-col gap-1">
            {topK.slice(1).map((item, i) => {
              const alt = getSpecies(item.label)
              return (
                <div key={i} className="flex items-center justify-between text-xs" style={{ color: 'var(--mist)' }}>
                  <span>{alt.common}</span>
                  <span>{Math.round(item.confidence * 100)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isMock && (
        <div className="px-5 pb-3 text-xs text-yellow-400/70 text-center">
          Demo mode — ONNX model not loaded yet
        </div>
      )}
    </div>
  )
}

function confidenceColor(c) {
  if (c >= 0.75) return '#6fcf97'
  if (c >= 0.5) return '#f6c90e'
  return '#ff9a5c'
}
