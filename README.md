# Bird Call ID

Identify Western Ghats bird species from their calls — in the browser, offline, no backend.

Hold your phone up to a bird, tap record, get an ID in seconds. Shazam for birds.

**Live demo:** _(coming after Phase 1 training)_

---

## What makes this interesting

Most BirdCLEF notebooks stay on Kaggle. This one ships as a working product:

- Fine-tuned EfficientNet-B0 on BirdCLEF 2024 (182 Western Ghats species)
- Exported to ONNX and run entirely in the browser via `onnxruntime-web`
- No backend call during inference — works offline once loaded
- Installable as a PWA on Android and iOS

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (PWA)                    │
│                                                     │
│  WebAudio API → Mel Spectrogram → ONNX Runtime     │
│  (32kHz, 5s)   (128×501, pure JS)  (EfficientNet)  │
│                                                     │
│  No network call during inference                   │
└─────────────────────────────────────────────────────┘
```

**Training stack:** PyTorch · torchaudio · Kaggle GPU (P100)  
**Dataset:** BirdCLEF 2024 — 182 Western Ghats species, ~60k clips  
**App stack:** React · Vite · onnxruntime-web · vite-plugin-pwa  

---

## Preprocessing spec

These parameters must match exactly between training (librosa) and inference (browser JS). Any mismatch silently degrades accuracy.

| Parameter | Value |
|-----------|-------|
| Sample rate | 32000 Hz |
| Clip length | 5 seconds |
| n_fft | 1024 |
| hop_length | 320 |
| n_mels | 128 |
| fmin | 20 Hz |
| fmax | 16000 Hz |
| Output shape | (128, 501) float32 |
| Mel scale | Slaney (htk=False) |
| Normalization | power → dB, top_db=80 |

Browser implementation: `app/src/utils/melSpectrogram.js` (pure JS, no deps, centered reflect padding to mirror librosa framing).  
Validate against librosa on 5 test clips before trusting inference.

---

## Project structure

```
bird-call-id/
├── app/                        # React PWA
│   └── src/
│       ├── hooks/
│       │   ├── useAudioRecorder.js   # WebAudio 5s recording
│       │   └── useBirdInference.js   # ONNX inference + mock
│       ├── utils/
│       │   ├── melSpectrogram.js     # FFT + mel filterbank (center-padded reflect framing)
│       │   ├── birdData.js           # Species labels + metadata
│       │   ├── classLabels.js        # BirdCLEF 2024 label order
│       │   └── inferenceHelpers.js   # top-K + mock inference helpers
│       └── components/
│           ├── RecordButton.jsx
│           ├── WaveformVisualizer.jsx
│           └── ResultCard.jsx
├── DESIGN.md                   # Architecture decisions
├── TODOS.md                    # Phase-by-phase task list
└── README.md
```

Training notebook and model card will be added after Phase 1.

---

## Roadmap

**Phase 1 — HF Spaces demo** _(in progress)_
- [ ] Train EfficientNet-B0 on BirdCLEF 2024 (Kaggle GPU)
- [ ] Push checkpoint to Hugging Face Hub
- [ ] Deploy Gradio demo to HF Spaces
- Target: cmAP ≥ 0.65 on public validation set

**Phase 2 — ONNX PWA** _(scaffolded)_
- [x] React + Vite PWA scaffold
- [x] WebAudio recording pipeline
- [x] Mel spectrogram in pure JS
- [x] onnxruntime-web inference hook
- [ ] Export PyTorch model to ONNX
- [ ] Validate ONNX parity with PyTorch (>99% top-1 match)
- [ ] Deploy to Vercel

---

## Running locally

```bash
cd app
npm install
npm run dev
```

The app runs in demo mode (mock predictions) until the ONNX model is placed at `app/public/model/birdclef.onnx`. If the model is absent, the UI now falls back to the mock result and returns to the ready state instead of hanging on loading.

### Utility scripts

```bash
npm run check:labels   # verify BirdCLEF label order + mapping helpers
npm run prepare:onnx   # copy ONNX Runtime browser assets into public/ort-wasm
npm run demo:check     # verify mock/demo wiring and prep state
```

---

## Plugging in the real model

Once the ONNX model is trained and exported:

1. Copy `birdclef.onnx` → `app/public/model/birdclef.onnx`
2. Copy the `ort-wasm/` files from `node_modules/onnxruntime-web/dist/` → `app/public/ort-wasm/`
3. Label order is centralized in `app/src/utils/classLabels.js` and verified by `npm run check:labels`; keep it synced with `train_metadata.csv` when the model metadata changes.

---

## Dataset

[BirdCLEF 2024](https://www.kaggle.com/competitions/birdclef-2024) — Western Ghats of India, 182 species, ~60k training clips at 32kHz.

---

## Results

_(To be updated after training)_

| Metric | Value |
|--------|-------|
| Val cmAP | — |
| Model size (ONNX) | — |
| Inference time (mid-range Android) | — |
