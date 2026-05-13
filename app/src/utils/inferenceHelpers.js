import { BIRD_CLASS_LABELS } from './classLabels.js'

export const CONFIDENCE_THRESHOLD = 0.4

export function buildTopK(probs, labels = BIRD_CLASS_LABELS, k = 3) {
  return Array.from(probs)
    .map((confidence, idx) => ({
      label: labels[idx] ?? `species_${idx}`,
      confidence,
      idx,
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, k)
}

export function buildInferenceResult(probs, labels = BIRD_CLASS_LABELS, confidenceThreshold = CONFIDENCE_THRESHOLD) {
  const topK = buildTopK(probs, labels, 3)
  return {
    topPrediction: topK[0],
    topK,
    detected: topK[0].confidence >= confidenceThreshold,
  }
}

export function mockInferenceResult() {
  const topK = [
    { label: 'malbab1', confidence: 0.82, idx: 23 },
    { label: 'malpie1', confidence: 0.11, idx: 24 },
    { label: 'indpea1', confidence: 0.04, idx: 18 },
  ]
  return {
    topPrediction: topK[0],
    topK,
    detected: true,
    isMock: true,
  }
}
