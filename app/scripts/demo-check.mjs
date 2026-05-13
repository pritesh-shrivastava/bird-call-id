import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BIRD_CLASS_LABELS } from '../src/utils/classLabels.js'
import { buildInferenceResult, mockInferenceResult } from '../src/utils/inferenceHelpers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const modelPath = path.join(root, 'public/model/birdclef.onnx')
const ortDir = path.join(root, 'public/ort-wasm')

const modelExists = await exists(modelPath)
const ortAssets = await listFiles(ortDir)

if (!ortAssets.length) {
  console.warn('ORT runtime assets are not present yet. Run `npm run prepare:onnx` before deploying the real model.')
}

const mock = mockInferenceResult()
if (!mock.isMock || mock.topPrediction.label !== 'malbab1' || !mock.detected) {
  throw new Error('Mock demo result is not wired correctly')
}

const probs = new Float32Array(BIRD_CLASS_LABELS.length)
probs[12] = 0.93
probs[44] = 0.05
probs[81] = 0.02
const realish = buildInferenceResult(probs, BIRD_CLASS_LABELS)
if (realish.topPrediction.label !== BIRD_CLASS_LABELS[12]) {
  throw new Error('Inference result helper does not map labels correctly')
}
if (!realish.detected) {
  throw new Error('Inference result helper should detect the synthetic confident prediction')
}

console.log(JSON.stringify({
  modelExists,
  ortAssets: ortAssets.length,
  labels: BIRD_CLASS_LABELS.length,
  mockLabel: mock.topPrediction.label,
  topLabel: realish.topPrediction.label,
  ready: true,
}, null, 2))

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function listFiles(dir) {
  try {
    const entries = await fs.readdir(dir)
    return entries.filter(name => name.startsWith('ort-wasm-simd-threaded.'))
  } catch {
    return []
  }
}
