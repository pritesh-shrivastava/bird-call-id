---
version: alpha
name: Bird Call ID
description: Forest-first bird call identification PWA for Western Ghats species, optimized for offline in-browser inference.
colors:
  primary: "#0D1F15"
  secondary: "#1A3A2A"
  tertiary: "#2D5A3D"
  accent: "#4CAF7D"
  accent-bright: "#6FCF97"
  muted: "#B2D8C5"
  neutral: "#F0EAD6"
typography:
  h1:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label-sm:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  pill: "9999px"
elevation:
  card: "0 12px 30px rgba(0, 0, 0, 0.24)"
  float: "0 20px 50px rgba(0, 0, 0, 0.28)"
components:
  app-shell:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.body-md}"
  record-button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
  record-button-active:
    backgroundColor: "{colors.accent-bright}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
  result-card:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.lg}"
    padding: "20px"
  waveform-bar:
    backgroundColor: "{colors.tertiary}"
    rounded: "{rounded.sm}"
    height: "4px"
  supporting-copy:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "0px"
---

## Overview

Bird Call ID is a forest-first PWA for identifying Western Ghats bird species from a short recording. The experience should feel like a field guide, not a lab dashboard: calm, fast, legible, and trustworthy.

The product differentiator is end-to-end delivery. The model is meant to run offline in the browser after load, with no backend inference path in the final product.

## Colors

- **Primary (`#0D1F15`)**: deep forest background; most screens live here.
- **Secondary (`#1A3A2A`)**: panel and card surface.
- **Tertiary (`#2D5A3D`)**: supporting surface and subtle depth.
- **Accent (`#4CAF7D`)**: primary action, capture state, and success signal.
- **Accent bright (`#6FCF97`)**: active pulse, waveform highlights, and confidence emphasis.
- **Muted (`#B2D8C5`)**: secondary text and soft UI chrome.
- **Neutral (`#F0EAD6`)**: primary readable text on dark surfaces.

Contrast should stay high. The app should never look neon or gimmicky.

## Typography

Inter leads the UI where emphasis matters. System sans serif remains the fallback for speed and consistency across platforms.

- **H1**: large, compact, confident title treatment.
- **H2**: section headers for cards and result blocks.
- **Body**: readable, low-friction text for instructions and analysis.
- **Label**: slightly tightened, all-purpose metadata style for species names, confidence, and control labels.

Keep copy short. This is a capture flow, not a documentation page.

## Layout

The layout should be vertically stacked and thumb-friendly.

- Primary action at or near the center of the viewport.
- Result area directly below the recording control.
- Secondary metadata in compact blocks, not dense tables.
- Respect safe areas and mobile viewports first.
- Favor generous vertical spacing over multi-column complexity.

## Elevation & Depth

Depth is subtle and used only to separate cards from the background.

- Cards should float slightly above the forest background.
- Avoid hard outlines unless they improve accessibility.
- Motion should be soft: pulse rings, waveform breathing, and simple slide-up reveals.

## Shapes

The product should feel organic but not playful.

- Large rounded buttons for the capture action.
- Medium-radius cards.
- Small-radius chips and badges.
- No sharp-cornered control chrome unless it conveys a technical state.

## Components

### App shell
The app shell uses the forest background with cream text. This creates a night-in-the-garden mood that fits the subject matter and keeps the UI distinct from generic AI dashboards.

### Record button
The record button is the visual anchor.
- Use the accent color for the default state.
- Use the brighter accent for active recording and pulse feedback.
- Keep the label short and direct.

### Result card
The result card should present the species, confidence, and any fallback message clearly.
- Make the predicted species the highest-priority text.
- Keep lower-confidence states explicit and honest.
- Use compact supporting metadata.

### Waveform
Waveform bars and activity indicators should be readable at a glance, but never overpower the result.
- Use accent-bright for active energy.
- Keep animation simple and loopable.

## Do's and Don'ts

- **Do** make the experience work cleanly on mobile first.
- **Do** keep the UI calm, not noisy.
- **Do** preserve the offline-first story in the visual language.
- **Do** keep error and low-confidence states explicit.
- **Don't** use heavy gradients or sci-fi styling.
- **Don't** crowd the screen with charts or debug text.
- **Don't** make the app feel like a Kaggle notebook pasted into a browser.

## Product Context

The underlying product goal is still the same:

1. Validate BirdCLEF 2024 model quality.
2. Ship a usable demo quickly.
3. Move to fully in-browser ONNX inference once parity is strong enough.

## Implementation Notes

The current app already follows this direction:

- React + Vite PWA scaffold
- WebAudio recording pipeline
- Pure JS mel spectrogram preprocessing with centered reflect padding to match librosa framing
- onnxruntime-web inference hook
- Demo mode while the real ONNX model is staged; missing model files fall back to the mock result instead of leaving the UI stuck in loading

The design system should stay aligned with those implementation constraints.
