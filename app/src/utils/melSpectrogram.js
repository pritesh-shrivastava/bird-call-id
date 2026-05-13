// Mel spectrogram matching librosa defaults (htk=False, Slaney normalization).
// IMPORTANT: validate output against librosa on 5 test clips before trusting ONNX inference.
// See DESIGN.md § "Preprocessing spec" for exact parameter requirements.

export const MEL_PARAMS = {
  sr: 32000,
  nMels: 128,
  hopLength: 320,
  nFft: 1024,
  fmin: 20,
  fmax: 16000,
  clipDuration: 5,
}

// Expected output shape: (128, 501) for a 5-second clip at 32kHz

function hannWindow(n) {
  const w = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)))
  }
  return w
}

// In-place Cooley-Tukey FFT (n must be power of 2)
function fft(re, im) {
  const n = re.length
  // Bit-reverse permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wRe = Math.cos(ang)
    const wIm = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0
      for (let j = 0; j < len / 2; j++) {
        const uRe = re[i + j], uIm = im[i + j]
        const vRe = re[i + j + len / 2] * curRe - im[i + j + len / 2] * curIm
        const vIm = re[i + j + len / 2] * curIm + im[i + j + len / 2] * curRe
        re[i + j] = uRe + vRe
        im[i + j] = uIm + vIm
        re[i + j + len / 2] = uRe - vRe
        im[i + j + len / 2] = uIm - vIm
        const nextRe = curRe * wRe - curIm * wIm
        curIm = curRe * wIm + curIm * wRe
        curRe = nextRe
      }
    }
  }
}

// Hz <-> Mel (Slaney, not HTK — matches librosa default htk=False)
function hzToMel(hz) {
  const f_min = 0.0
  const f_sp = 200.0 / 3
  const min_log_hz = 1000.0
  const min_log_mel = (min_log_hz - f_min) / f_sp
  const logstep = Math.log(6.4) / 27.0
  if (hz >= min_log_hz) {
    return min_log_mel + Math.log(hz / min_log_hz) / logstep
  }
  return (hz - f_min) / f_sp
}

function melToHz(mel) {
  const f_min = 0.0
  const f_sp = 200.0 / 3
  const min_log_hz = 1000.0
  const min_log_mel = (min_log_hz - f_min) / f_sp
  const logstep = Math.log(6.4) / 27.0
  if (mel >= min_log_mel) {
    return min_log_hz * Math.exp(logstep * (mel - min_log_mel))
  }
  return f_min + f_sp * mel
}

function buildMelFilterbank(sr, nFft, nMels, fmin, fmax) {
  const nFreqs = Math.floor(nFft / 2) + 1
  const fftFreqs = new Float32Array(nFreqs)
  for (let i = 0; i < nFreqs; i++) {
    fftFreqs[i] = (sr / nFft) * i
  }

  const melMin = hzToMel(fmin)
  const melMax = hzToMel(fmax)
  const melPoints = new Float32Array(nMels + 2)
  for (let i = 0; i < nMels + 2; i++) {
    melPoints[i] = melToHz(melMin + (i / (nMels + 1)) * (melMax - melMin))
  }

  // weights[m][f]
  const weights = []
  for (let m = 0; m < nMels; m++) {
    const row = new Float32Array(nFreqs)
    const lower = melPoints[m]
    const center = melPoints[m + 1]
    const upper = melPoints[m + 2]
    const norm = 2.0 / (upper - lower)
    for (let f = 0; f < nFreqs; f++) {
      const freq = fftFreqs[f]
      if (freq >= lower && freq <= center) {
        row[f] = norm * (freq - lower) / (center - lower)
      } else if (freq > center && freq <= upper) {
        row[f] = norm * (upper - freq) / (upper - center)
      }
    }
    weights.push(row)
  }
  return weights
}

const TOP_DB = 80.0

function powerToDb(spec, nMels, nFrames) {
  let maxVal = -Infinity
  for (let i = 0; i < nMels * nFrames; i++) {
    if (spec[i] > maxVal) maxVal = spec[i]
  }
  const refDb = 10 * Math.log10(Math.max(maxVal, 1e-10))
  for (let i = 0; i < nMels * nFrames; i++) {
    spec[i] = 10 * Math.log10(Math.max(spec[i], 1e-10)) - refDb
    if (spec[i] < -TOP_DB) spec[i] = -TOP_DB
  }
}

// Returns Float32Array of shape (nMels * nFrames) in row-major order.
// Feed to ONNX as shape [1, 1, nMels, nFrames].
export function computeMelSpectrogram(samples, params = MEL_PARAMS) {
  const { sr, nMels, hopLength, nFft, fmin, fmax } = params
  const nFrames = Math.floor((samples.length - nFft) / hopLength) + 1
  const nFreqs = Math.floor(nFft / 2) + 1
  const window = hannWindow(nFft)
  const filterbank = buildMelFilterbank(sr, nFft, nMels, fmin, fmax)

  const result = new Float32Array(nMels * nFrames)
  const re = new Float32Array(nFft)
  const im = new Float32Array(nFft)

  for (let t = 0; t < nFrames; t++) {
    const offset = t * hopLength
    re.fill(0)
    im.fill(0)
    for (let i = 0; i < nFft; i++) {
      re[i] = (offset + i < samples.length ? samples[offset + i] : 0) * window[i]
    }
    fft(re, im)
    // Power spectrum
    const power = new Float32Array(nFreqs)
    for (let f = 0; f < nFreqs; f++) {
      power[f] = re[f] * re[f] + im[f] * im[f]
    }
    // Apply mel filterbank
    for (let m = 0; m < nMels; m++) {
      let val = 0
      for (let f = 0; f < nFreqs; f++) val += filterbank[m][f] * power[f]
      result[m * nFrames + t] = val
    }
  }

  powerToDb(result, nMels, nFrames)
  return { data: result, nMels, nFrames }
}

// Resample Float32Array from srcRate to dstRate (linear interpolation)
export function resample(samples, srcRate, dstRate) {
  if (srcRate === dstRate) return samples
  const ratio = srcRate / dstRate
  const outLength = Math.floor(samples.length / ratio)
  const out = new Float32Array(outLength)
  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio
    const idx = Math.floor(pos)
    const frac = pos - idx
    out[i] = idx + 1 < samples.length
      ? samples[idx] * (1 - frac) + samples[idx + 1] * frac
      : samples[idx]
  }
  return out
}
