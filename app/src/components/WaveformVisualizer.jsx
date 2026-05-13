export function WaveformVisualizer({ waveform, active }) {
  const bars = Array.from(waveform)
  const n = bars.length

  return (
    <div className="flex items-center justify-center gap-[2px] h-16 w-full max-w-xs mx-auto">
      {bars.map((amp, i) => {
        const height = active ? Math.max(4, amp * 56) : 4
        const delay = (i / n) * 300
        return (
          <div
            key={i}
            className="w-[3px] rounded-full transition-all duration-75"
            style={{
              height: `${height}px`,
              background: active
                ? `rgba(76, 175, 125, ${0.4 + amp * 0.6})`
                : 'rgba(76, 175, 125, 0.2)',
              animationDelay: `${delay}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
