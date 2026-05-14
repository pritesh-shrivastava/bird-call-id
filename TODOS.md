# Bird Call ID — Todos

Last updated: 2026-05-14 IST

## Pending non-coding tasks from Pritesh's end for deploy

These are the user-side tasks needed before a real public deploy makes sense.

- [ ] Decide what you want the *first public deploy* to be:
  - demo-mode PWA only, or
  - model-backed PWA with the real ONNX artifact
- [ ] Create / confirm access to the accounts needed for shipping:
  - Kaggle (for BirdCLEF 2024 training access)
  - Hugging Face (for model hosting/model card if used)
  - Vercel or Cloudflare Pages (for static app hosting)
- [ ] Accept the BirdCLEF 2024 competition rules on Kaggle.
- [ ] Decide the final public project naming you want on resume/portfolio:
  - repo name
  - hosted app name
  - model name/card name
- [ ] Decide where the model artifact will live for the public version:
  - committed/staged with the app, or
  - hosted separately on Hugging Face Hub / another artifact host
- [ ] Finish or obtain the trained checkpoint / exported ONNX artifact needed for a real deploy.
- [ ] Gather the exact model-side assets needed for the frontend:
  - `birdclef.onnx`
  - matching label metadata
  - ONNX Runtime browser assets if required
- [ ] Collect a small real-world smoke-test set for launch validation:
  - at least 10 bird-call clips
  - ideally Western Ghats / India-relevant examples
- [ ] Decide whether the public launch should happen only after ONNX/PyTorch parity is validated, or whether you want an earlier demo-mode portfolio deploy first.
- [ ] Once the hosted app is up, run one manual smoke test on mobile and one on desktop.
- [ ] Send me either the live URL or the exact deploy/runtime issue once you reach that point.

## Deployment blockers to clear before public launch

Grounded in the current repo state:
- `README.md` says the app still runs in demo mode until the trained BirdCLEF model is exported and dropped into `app/public/model/birdclef.onnx`.
- `README.md` also says the live demo is not published yet and hosted demo comes after model export + parity validation.
- The current app is already in good shape as a PWA/demo scaffold; the biggest remaining blocker is model artifact readiness plus deployment decisions.

---

## Phase 1: Fine-Tune + HF Spaces Demo

### Dataset & Environment
- [ ] Create Kaggle account and accept BirdCLEF 2024 competition rules
- [ ] Enable Kaggle GPU (P100) in notebook settings
- [ ] Verify dataset path: `/kaggle/input/birdclef-2024/train_audio/` (~182 species, ~60k clips)
- [ ] Inspect `train_metadata.csv` — understand columns: `filename`, `primary_label`, `secondary_labels`, `rating`, `author`

### Training Notebook
- [ ] Write mel spectrogram pipeline (32kHz, 5s clip, n_mels=128, hop_length=320, n_fft=1024, fmin=20, fmax=16000)
- [ ] Implement `BirdDataset` PyTorch class — loads audio, computes spectrogram, returns (spec, label) pairs
- [ ] Fine-tune EfficientNet-B0 (pretrained ImageNet) with 182-class head
- [ ] Train with mixed precision (torch.cuda.amp) — needed to stay within Kaggle GPU memory
- [ ] Add stratified train/val split (preserve per-species balance)
- [ ] Implement cmAP evaluation metric (BirdCLEF standard, not plain accuracy)
- [ ] Save best checkpoint by val cmAP
- [ ] Run at least 10 epochs; target val cmAP >= 0.65

### Hugging Face
- [ ] Create HF account and generate write token
- [ ] Push model checkpoint + config to HF Hub (`pritesh/birdclef-india-efficientnet-b0`)
- [ ] Write model card: architecture, dataset (BirdCLEF 2024), cmAP score, preprocessing spec, 5 example species
- [ ] Build Gradio demo: upload audio → mel spectrogram → top-3 predictions with confidence
- [ ] Deploy Gradio demo to HF Spaces — get shareable URL

### Validation
- [ ] Test demo on at least 10 real Western Ghats bird calls (download from Xeno-Canto, filter by India/Western Ghats region)
- [ ] Verify `no bird detected` state triggers below confidence 0.4

---

## Phase 2: ONNX + React PWA

### ONNX Export
- [ ] Export PyTorch checkpoint to ONNX (`torch.onnx.export`)
- [ ] Verify ONNX parity: top-1 predictions match PyTorch on >99% of validation set
- [ ] Quantize to int8 (~6MB target) if base ONNX export exceeds 25MB
- [ ] Test ONNX inference locally with `onnxruntime`

### Browser Audio Pipeline
- [x] Scaffold React + Vite PWA (`vite-plugin-pwa`)
- [x] Implement WebAudio API recording: press-and-hold 5 seconds (`useAudioRecorder.js`)
- [x] Implement mel spectrogram in pure JS with matching params — sr=32kHz, n_mels=128, hop_length=320, n_fft=1024, fmin=20, fmax=16000 (`melSpectrogram.js`)
- [ ] **Validate mel spectrogram JS output vs librosa on 5 test clips** — centered reflect padding is implemented, but numeric parity still needs verification before trusting inference
- [x] Wire up `onnxruntime-web` inference hook with mock fallback (`useBirdInference.js`)
- [ ] Drop real ONNX model into `app/public/model/birdclef.onnx`
- [x] Label order is centralized in `classLabels.js` and verified by `npm run check:labels` — keep it synced with `train_metadata.csv` when model metadata changes
- [ ] End-to-end test: recording → spectrogram → ONNX inference → correct prediction

### UX
- [x] Press-and-hold record button (5s countdown + progress ring)
- [x] Live waveform visualizer during recording
- [x] Show top prediction + confidence score
- [x] Show "No bird detected" when confidence < 0.4
- [ ] Add species info images (thumbnail from Wikipedia/iNaturalist)
- [x] PWA manifest + service worker for offline + installability

### Deployment
- [ ] Deploy to Vercel or Cloudflare Pages (static, free tier)
- [ ] Test on mid-range Android: inference must complete within 5s
- [ ] Test offline mode (no network, inference still works)

---

## Portfolio Wrap-Up

- [ ] Add demo GIF to README
- [ ] Add training notebook to repo (cleaned, with markdown cells explaining each step)
- [ ] Add architecture diagram to README
- [ ] Update README Results table with final cmAP, model size, inference latency
- [ ] Add link to HF model card and live PWA demo in README
- [ ] Post to LinkedIn with demo video
