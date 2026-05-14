import { useState, useCallback } from 'react'
import { RecordButton } from './components/RecordButton'
import { ResultCard } from './components/ResultCard'
import { WaveformVisualizer } from './components/WaveformVisualizer'
import { useAudioRecorder } from './hooks/useAudioRecorder'
import { useBirdInference } from './hooks/useBirdInference'
import { mockInferenceResult } from './utils/inferenceHelpers'

function getShowcaseMode() {
  if (typeof window === 'undefined') return null
  const mode = new URLSearchParams(window.location.search).get('showcase')
  return ['hero', 'recording', 'result', 'error'].includes(mode) ? mode : null
}

export default function App() {
  const showcaseMode = getShowcaseMode()
  const { record, cancel, state: recState, progress, waveform } = useAudioRecorder()
  const { infer, status: inferStatus } = useBirdInference()
  const [result, setResult] = useState(null)

  const combinedState = inferStatus === 'loading' || inferStatus === 'inferring'
    ? inferStatus
    : recState

  const displayState = showcaseMode === 'recording'
    ? 'recording'
    : showcaseMode === 'error'
      ? 'error'
      : combinedState
  const displayProgress = showcaseMode === 'recording' ? 0.64 : progress
  const displayWaveform = showcaseMode === 'recording'
    ? Float32Array.from({ length: 64 }, (_, i) => Math.abs(Math.sin(i / 4)) * (i % 5 === 0 ? 0.9 : 0.55))
    : waveform
  const displayResult = showcaseMode === 'result' ? mockInferenceResult() : result

  const handleStart = useCallback(async () => {
    setResult(null)
    const samples = await record()
    if (!samples) return
    const res = await infer(samples)
    setResult(res)
  }, [record, infer])

  const handleCancel = useCallback(() => {
    cancel()
    setResult(null)
  }, [cancel])

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--forest-dark)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦜</span>
          <span className="font-semibold text-lg tracking-tight" style={{ color: 'var(--cream)' }}>
            Bird Call ID
          </span>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{ background: 'rgba(76,175,125,0.15)', color: 'var(--leaf)' }}
        >
          Western Ghats
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 gap-10 pb-12">
        {/* Hero text */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--cream)' }}>
            Hear a bird?
          </h1>
          <p className="text-sm" style={{ color: 'var(--mist)' }}>
            Record 5 seconds and identify it instantly
          </p>
        </div>

        {/* Waveform */}
        <WaveformVisualizer
          waveform={displayWaveform}
          active={displayState === 'recording'}
        />

        {/* Record button */}
        <RecordButton
          state={displayState}
          progress={displayProgress}
          onStart={handleStart}
          onCancel={handleCancel}
        />

        {/* Result */}
        {displayResult && (
          <ResultCard result={displayResult} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 text-xs" style={{ color: 'rgba(178, 216, 197, 0.4)' }}>
        182 Western Ghats species · In-browser inference
      </footer>
    </div>
  )
}
