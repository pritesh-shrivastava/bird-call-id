import { useState, useCallback } from 'react'
import { RecordButton } from './components/RecordButton'
import { ResultCard } from './components/ResultCard'
import { WaveformVisualizer } from './components/WaveformVisualizer'
import { useAudioRecorder } from './hooks/useAudioRecorder'
import { useBirdInference } from './hooks/useBirdInference'

export default function App() {
  const { record, cancel, state: recState, progress, waveform } = useAudioRecorder()
  const { infer, status: inferStatus } = useBirdInference()
  const [result, setResult] = useState(null)

  const combinedState = inferStatus === 'loading' || inferStatus === 'inferring'
    ? inferStatus
    : recState

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
          waveform={waveform}
          active={recState === 'recording'}
        />

        {/* Record button */}
        <RecordButton
          state={combinedState}
          progress={progress}
          onStart={handleStart}
          onCancel={handleCancel}
        />

        {/* Result */}
        {result && (
          <ResultCard result={result} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 text-xs" style={{ color: 'rgba(178, 216, 197, 0.4)' }}>
        182 Western Ghats species · In-browser inference
      </footer>
    </div>
  )
}
