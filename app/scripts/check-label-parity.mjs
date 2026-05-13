import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BIRD_CLASS_LABELS } from '../src/utils/classLabels.js'
import { buildTopK } from '../src/utils/inferenceHelpers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const snapshotPath = path.resolve(__dirname, '../test-data/birdclef-labels.snapshot.json')

const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'))

assertEqual(BIRD_CLASS_LABELS, snapshot, 'BirdCLEF label order snapshot')
assertEqual(new Set(BIRD_CLASS_LABELS).size, BIRD_CLASS_LABELS.length, 'BirdCLEF labels are unique')
assertEqual(BIRD_CLASS_LABELS.length, 182, 'BirdCLEF label count')

const probs = new Float32Array(BIRD_CLASS_LABELS.length)
probs[0] = 0.9
probs[1] = 0.08
probs[2] = 0.02
const topK = buildTopK(probs, BIRD_CLASS_LABELS, 3)
assertEqual(topK[0].label, BIRD_CLASS_LABELS[0], 'Top-1 label mapping')
assertEqual(topK[1].label, BIRD_CLASS_LABELS[1], 'Top-2 label mapping')

console.log('Label parity check passed.')

function assertEqual(actual, expected, message) {
  const same = Array.isArray(actual) && Array.isArray(expected)
    ? actual.length === expected.length && actual.every((v, i) => v === expected[i])
    : actual === expected
  if (!same) {
    throw new Error(`${message} failed`)
  }
}
