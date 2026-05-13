import { useState, useRef, useCallback } from 'react'
import { resample, MEL_PARAMS } from '../utils/melSpectrogram'

const TARGET_SR = MEL_PARAMS.sr          // 32000 Hz
const CLIP_DURATION = MEL_PARAMS.clipDuration  // 5 seconds
const BUFFER_SIZE = 4096

export function useAudioRecorder() {
  const [state, setState] = useState('idle') // idle | requesting | recording | done | error
  const [progress, setProgress] = useState(0) // 0-1 over clip duration
  const [waveform, setWaveform] = useState(new Float32Array(64))

  const contextRef = useRef(null)
  const processorRef = useRef(null)
  const sourceRef = useRef(null)
  const samplesRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(0)
  const resolveRef = useRef(null)

  const stop = useCallback(() => {
    clearInterval(timerRef.current)
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current.mediaStream?.getTracks().forEach(t => t.stop())
      sourceRef.current = null
    }
  }, [])

  // Returns a Float32Array of audio samples at TARGET_SR, or null on error.
  const record = useCallback(() => {
    return new Promise(async (resolve) => {
      resolveRef.current = resolve
      setState('requesting')
      samplesRef.current = []

      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: { ideal: TARGET_SR },
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })
      } catch (err) {
        setState('error')
        resolve(null)
        return
      }

      const ctx = new AudioContext({ sampleRate: TARGET_SR })
      contextRef.current = ctx
      const actualSr = ctx.sampleRate

      const source = ctx.createMediaStreamSource(stream)
      sourceRef.current = source
      sourceRef.current.mediaStream = stream

      // ScriptProcessorNode for sample collection
      const processor = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1)
      processorRef.current = processor

      const maxSamples = TARGET_SR * CLIP_DURATION

      processor.onaudioprocess = (e) => {
        const chunk = e.inputBuffer.getChannelData(0)
        const collected = samplesRef.current
        for (let i = 0; i < chunk.length; i++) {
          collected.push(chunk[i])
        }

        // Live waveform: downsample last 64 values for visualization
        const wf = new Float32Array(64)
        const step = Math.floor(chunk.length / 64)
        for (let i = 0; i < 64; i++) wf[i] = Math.abs(chunk[i * step] || 0)
        setWaveform(wf)

        if (collected.length >= maxSamples) {
          finish(ctx, actualSr, collected, resolve)
        }
      }

      source.connect(processor)
      processor.connect(ctx.destination)

      setState('recording')
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000
        const p = Math.min(elapsed / CLIP_DURATION, 1)
        setProgress(p)
        if (p >= 1) clearInterval(timerRef.current)
      }, 50)
    })
  }, [stop])

  const cancel = useCallback(() => {
    stop()
    setState('idle')
    setProgress(0)
    if (resolveRef.current) {
      resolveRef.current(null)
      resolveRef.current = null
    }
  }, [stop])

  function finish(ctx, actualSr, collected, resolve) {
    stop()
    const maxSamples = TARGET_SR * CLIP_DURATION
    let raw = new Float32Array(collected.slice(0, maxSamples))
    // Resample only if AudioContext couldn't honour requested rate
    if (actualSr !== TARGET_SR) {
      raw = resample(raw, actualSr, TARGET_SR)
    }
    setState('done')
    setProgress(1)
    resolve(raw)
  }

  return { record, cancel, state, progress, waveform }
}
