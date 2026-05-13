import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const srcDir = path.join(root, 'node_modules/onnxruntime-web/dist')
const destDir = path.join(root, 'public/ort-wasm')

await fs.mkdir(destDir, { recursive: true })

const files = await fs.readdir(srcDir)
const targets = files.filter(name => name.startsWith('ort-wasm-simd-threaded.'))

if (targets.length === 0) {
  throw new Error(`No ORT wasm assets found in ${srcDir}`)
}

for (const name of targets) {
  await fs.copyFile(path.join(srcDir, name), path.join(destDir, name))
}

console.log(`Copied ${targets.length} ONNX Runtime assets to ${path.relative(root, destDir)}`)
