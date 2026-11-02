# SkillNest Academy — landing page (HTML / CSS / JS)

Open `index.html` in a browser (no build step, no dependencies). Fonts load from Google Fonts; system fonts are the fallback offline.

## Hero video
No video file was supplied, so none is referenced. The hero shows `assets/hero-poster.webp`.
To enable the video, add sources inside the `<video data-hero-video>` element in `index.html`:
`<source src="assets/video/hero.webm" type="video/webm">` and/or `<source src="assets/video/hero.mp4" type="video/mp4">`.
It then autoplays muted, looped and inline, fades in over the poster, pauses off-screen, and is skipped for reduced-motion / data-saver users.

## Registration form
Front-end validation and a confirmation state only. Nothing is sent or stored. Hook up your endpoint in `script.js` (search "No backend is configured").

## Placeholders to replace
Partner logos (trust strip), social links, contact details, Privacy Policy / Terms pages, hero video.

## Assets
Images are optimised crops/exports of the six supplied SkillNest images. `logo.png` and `favicon.png` are cropped from `SkillNest_WebUI_Assets_2.png` with the background made transparent — replace with the official logo file when available.
