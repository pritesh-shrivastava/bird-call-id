import { useState, useRef, useCallback } from 'react'
import { computeMelSpectrogram, MEL_PARAMS } from '../utils/melSpectrogram'
import { BIRD_CLASS_LABELS } from '../utils/classLabels'
import {
  buildInferenceResult,
  mockInferenceResult,
} from '../utils/inferenceHelpers'

// When the ONNX model is ready, set MODEL_URL to the path of the .onnx file
// placed in public/model/birdclef.onnx (or use CDN URL).
// Quantized int8 target: ~6MB. See DESIGN.md § "ONNX Export".
const MODEL_URL = '/model/birdclef.onnx'

export function useBirdInference() {
  const [status, setStatus] = useState('idle') // idle | loading | inferring | done | error
  const sessionRef = useRef(null)

  // Lazy-load the ONNX session on first inference call
  const loadSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current
    const ort = await import('onnxruntime-web')
    ort.env.wasm.wasmPaths = '/ort-wasm/'
    const session = await ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ['wasm'],
    })
    sessionRef.current = session
    return session
  }, [])

  const infer = useCallback(async (samples) => {
    setStatus('loading')

    // If the model is not staged yet, keep the demo usable by returning the mock result.
    try {
      const res = await fetch(MODEL_URL, { method: 'HEAD' })
      if (!res.ok) {
        setStatus('done')
        return mockInferenceResult()
      }
    } catch {
      setStatus('done')
      return mockInferenceResult()
    }

    try {
      const session = await loadSession()
      setStatus('inferring')

      const { data, nMels, nFrames } = computeMelSpectrogram(samples, MEL_PARAMS)
      // Pad or trim to exactly (128, 501)
      const TARGET_FRAMES = 501
      const spec = padOrTrim(data, nMels, nFrames, TARGET_FRAMES)

      const ort = await import('onnxruntime-web')
      const tensor = new ort.Tensor('float32', spec, [1, 1, nMels, TARGET_FRAMES])
      const feeds = { [session.inputNames[0]]: tensor }
      const output = await session.run(feeds)

      const logits = output[session.outputNames[0]].data
      const probs = softmax(logits)

      setStatus('done')
      return buildInferenceResult(probs, BIRD_CLASS_LABELS)
    } catch (err) {
      console.error('Inference error:', err)
      setStatus('error')
      return null
    }
  }, [loadSession])

  return { infer, status }
}

function padOrTrim(data, nMels, nFrames, targetFrames) {
  const out = new Float32Array(nMels * targetFrames)
  const copyFrames = Math.min(nFrames, targetFrames)
  for (let m = 0; m < nMels; m++) {
    for (let t = 0; t < copyFrames; t++) {
      out[m * targetFrames + t] = data[m * nFrames + t]
    }
  }
  return out
}

function softmax(logits) {
  const max = Math.max(...logits)
  const exp = Array.from(logits).map(x => Math.exp(x - max))
  const sum = exp.reduce((a, b) => a + b, 0)
  return exp.map(x => x / sum)
}
