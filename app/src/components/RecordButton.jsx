import { useRef } from 'react'

export function RecordButton({ state, progress, onStart, onCancel }) {
  const isRecording = state === 'recording'
  const isRequesting = state === 'requesting'
  const isInferring = state === 'inferring' || state === 'loading'
  const disabled = isRequesting || isInferring

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  // Support both mouse and touch for press-and-hold
  const holdRef = useRef(false)

  function handleStart(e) {
    e.preventDefault()
    if (disabled) return
    if (isRecording) return
    holdRef.current = true
    onStart()
  }

  function handleEnd(e) {
    e.preventDefault()
    if (isRecording) {
      // Early cancel — recording auto-stops at 5s but user can cancel
      onCancel()
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 no-select">
      <div className="relative flex items-center justify-center">
        {/* Pulse rings while recording */}
        {isRecording && (
          <>
            <div className="absolute rounded-full border-2 border-green-400/30 w-40 h-40"
              style={{ animation: 'pulse-ring 1.2s ease-out infinite' }} />
            <div className="absolute rounded-full border-2 border-green-400/20 w-40 h-40"
              style={{ animation: 'pulse-ring 1.2s ease-out 0.4s infinite' }} />
          </>
        )}

        {/* Progress ring */}
        <svg className="absolute" width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="rgba(76, 175, 125, 0.15)"
            strokeWidth="4"
          />
          {isRecording && (
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="#4caf7d"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          )}
        </svg>

        {/* Main button */}
        <button
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          disabled={disabled}
          className={`
            relative z-10 w-24 h-24 rounded-full flex items-center justify-center
            transition-all duration-150 cursor-pointer
            ${isRecording
              ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/40'
              : isInferring
                ? 'bg-green-700/60 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 active:scale-95 shadow-lg shadow-green-900/60'
            }
          `}
          aria-label={isRecording ? 'Stop recording' : 'Record bird call'}
        >
          {isRecording ? (
            <span className="w-8 h-8 bg-white rounded-sm" />
          ) : isInferring ? (
            <Spinner />
          ) : (
            <MicIcon />
          )}
        </button>
      </div>

      <p className="text-sm text-green-300/70 tracking-wide">
        {isRequesting && 'Requesting microphone…'}
        {isRecording && `Recording… ${Math.round(progress * 5)}s / 5s`}
        {isInferring && 'Identifying…'}
        {(state === 'idle' || state === 'done') && 'Tap to record a 5-second clip'}
        {state === 'error' && 'Microphone access denied'}
      </p>
    </div>
  )
}

function MicIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
