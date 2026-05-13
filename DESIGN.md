# Design: Bird Call Identification PWA

## Problem Statement

Build a bird call identification app (web + mobile PWA) for bird species found in the Western Ghats of India. The app listens to a short recording and identifies the species.

The gap in the space: hundreds of BirdCLEF notebooks exist on Kaggle. Almost none are deployed as real products. The goal here is the full stack — fine-tuned audio ML model running in the browser, offline, with no backend.

## Constraints

- No backend hosting budget (free tier acceptable, prefer zero-server for final product)
- **BirdCLEF 2024** dataset — specifically designed for birds of the Western Ghats (~182 species), publicly available on Kaggle, with real competition baselines

## Premises

1. BirdCLEF 2024 is the right dataset: Western Ghats of India, 182 species, ~60k training clips, active competition with public baselines to reference.
2. The differentiator vs. other Kaggle notebooks is end-to-end deployment.
3. A working demo someone can open and use matters more than SOTA accuracy.
4. In-browser ONNX inference is worth building toward: eliminates hosting, works offline, makes a compelling technical story.

## Approaches Considered

### Approach A: Classic Backend (FastAPI + PyTorch)
- Fine-tune EfficientNet/BirdNET on BirdCLEF, serve via FastAPI, React PWA sends audio to API.
- Effort: M (1-2 weekends). Risk: Low.
- Pros: Standard ML engineering pattern, easy model iteration.
- Cons: Needs hosting, latency on mobile, cold start issues.

### Approach B: In-Browser ONNX Inference
- Fine-tune in Python, export to ONNX, run inference in browser via onnxruntime-web. WebAudio API for recording, mel spectrogram computed in JS.
- Effort: L (2-3 weekends). Risk: Med.
- Pros: Runs offline in-browser — rare, impressive product story.
- Cons: ONNX export can be finicky; browser audio pipeline is non-trivial.

### Approach C: Hugging Face Spaces (Zero-Infra Demo)
- Fine-tune model, push to HF Hub, deploy Gradio demo on Spaces. PWA wrapper calls HF Inference API.
- Effort: S (1 weekend). Risk: Low.
- Pros: Shareable link quickly, model card is a clean artifact.
- Cons: Less technically interesting; limited UX control.

## Recommended Approach

**Phase 1: Approach C — HF Spaces**
Validate that the fine-tuned model actually works before investing in the ONNX pipeline. Goals: run BirdCLEF baseline training, fine-tune EfficientNet-B0 on BirdCLEF 2024 data, push to Hugging Face Hub, deploy Gradio demo on Spaces. Deliverable: a shareable URL that identifies bird calls from an uploaded audio file.

**Phase 2: Approach B — ONNX PWA**
Export the validated model to ONNX, build a React PWA with WebAudio API recording and onnxruntime-web inference. Deliverable: a mobile-installable PWA that identifies birds from a 5-second recording, no server required.

## Tech Stack

**Training:**
- Dataset: BirdCLEF 2024 (`birdclef-2024`, Western Ghats focus)
- Base model: EfficientNet-B0 on mel spectrograms (simple, well-documented, straightforward ONNX export)
- Framework: PyTorch + torchaudio
- Training environment: Kaggle Notebooks (free GPU, dataset co-located)

**Preprocessing spec (must match between training and browser):**
- Sample rate: 32000 Hz
- Clip length: 5 seconds
- Mel spectrogram: n_mels=128, hop_length=320, n_fft=1024, fmin=20, fmax=16000
- Output shape: (128, 501) float32
- Mel scale: Slaney (htk=False, matches librosa default)
- These values must be reproduced exactly in the browser. Mismatch = silent accuracy degradation.
- Validate JS mel output against librosa on 5 test clips before trusting Phase 2 inference.

**Phase 1 serving:**
- HF Hub (model weights + model card)
- Gradio demo on HF Spaces (free tier)

**Phase 2 app:**
- React + Vite PWA
- onnxruntime-web for in-browser inference
- WebAudio API for live recording
- Mel spectrogram computed in JS (`app/src/utils/melSpectrogram.js`)
- Deployed to Vercel or Cloudflare Pages (static, free)

## Open Questions

1. **Model size:** EfficientNet-B0 exported to ONNX is ~20-25MB. First inference on a mid-range Android may exceed 3s. Validate mobile benchmark early; quantize to int8 (~6MB) if needed. Target latency: 5s on mid-range Android for v1.
2. **Recording UX:** Press-and-hold for 5 seconds, then inference on release. Do NOT attempt sliding-window real-time inference for v1 — significantly higher complexity with no user-visible benefit.
3. **ONNX export parity:** After exporting to ONNX, top-1 predictions must match PyTorch on >99% of the validation set before proceeding to Phase 2.
4. **Audio preprocessing in browser:** Validate JS mel spectrogram output against librosa on at least 5 test clips before trusting inference.

## Success Criteria

- **Phase 1:** A URL someone can open that correctly identifies Western Ghats bird species from uploaded audio. Model achieves cmAP >= 0.65 on the BirdCLEF 2024 public validation set. Model card on HF Hub with architecture, dataset, and score.
- **Phase 2:** A PWA installable on mobile. Press-and-hold records 5s, inference completes within 5s on mid-range Android, no backend call during inference. Low-confidence state (< 0.4) shows "no bird detected" instead of a wrong ID.

## Distribution

- Phase 1: Hugging Face Spaces
- Phase 2: Vercel or Cloudflare Pages (static PWA)
- GitHub repo: README with demo, training details, model architecture, preprocessing spec, results
