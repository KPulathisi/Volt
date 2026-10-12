# VOLT · The Future Moves Differently

An interactive 3D showroom for **VOLT**, a fictional electric vehicle brand. Visitors orbit a real-time 3D car, change its paint, wheels, interior and packages with live pricing, compare three models, explore charging and specifications, and share or download their configuration.

> VOLT is fictional. Vehicles, specifications and prices are illustrative concept figures, not verified real-world performance, and nothing on the site can be ordered.

## Highlights

- **Real-time 3D car without model files.** The car is generated in code with Three.js from cross-sections (`src/three/carProfile.js`), so paint, wheels, interior and packages update the actual geometry and materials. The Performance Package adds a wing and lime calipers and lowers the car; the Technology Package adds a roof sensor. The same shape data draws the 2D fallback.
- **Configurator** with validated state, configuration-dependent pricing, range and acceleration estimates, URL sharing, saving on the device, a printable summary and a downloadable PNG specification sheet.
- **Scroll storytelling:** a scroll-driven camera orbit in the hero, a pinned five-chapter design story with changing backgrounds, a film band that opens up, animated counters and comparison bars.
- **Interactive explainers:** 3D hotspots, a real-time 0–100 km/h demo, a dimensioned technical drawing, an explorable battery pack and a charging-curve calculator.
- **Static and private:** no backend, database, accounts, tracking or API keys.

## Stack

Vue 3 + Vite · Three.js · GSAP 3 (ScrollTrigger, SplitText, Flip, DrawSVG) · Lenis · Lucide icons · Fontsource (Archivo variable with width axis, JetBrains Mono) · local JSON data · localStorage.

## Getting started

Requires Node 20.19 or newer (Node 22 recommended).

```bash
npm install
npm run dev        # http://localhost:5173  ·  admin at http://localhost:5173/#/admin
npm run build      # production build in dist/
npm run preview    # serve the build locally
npm run prompts    # regenerate docs/MEDIA_PROMPTS.md from src/data/media.json
```

## Pages

| Route | Contents |
| --- | --- |
| `/#/` | Hero, VOLT ONE showcase with hotspots, configurator preview, design story, film band, performance, energy, model comparison, gallery, final call to action |
| `/#/configure` | Full configurator with a sticky 3D view and the configuration summary |
| `/#/models` | The three models and a comparison table |
| `/#/technology` | Specifications, energy and charging, questions |
| `/#/project` | Disclaimer, real vs. simulated, how it works, asset inventory and licences |

## Configuration links

The configurator keeps the build in the address, for example:

```
#/configure?model=one&paint=lime&wheels=turbine-21&interior=cognac&pkg=tech,performance
```

Every value is checked against the catalogue. Unknown values, wheels not offered on a model, or invalid packages fall back to safe defaults, and the page tells the visitor what was changed. Standard packages (the Performance Package on VOLT PERFORMANCE) are always included and locked.

## Data and architecture

```
src/
  data/                 vehicles, colors, wheels, interiors, packages, site text, media slots (JSON)
  composables/
    useVehicleConfig.js validated configuration state, URL and localStorage
    useVehiclePricing.js pure price, range and acceleration calculation
    useSpecSheet.js     PNG specification sheet
  three/
    carProfile.js       shared car shape (used by 3D and 2D)
    carModel.js         procedural body, canopy, lights, wheels, interior, packages
    CarStage.js         renderer, studio lighting, controls, on-demand render loop
  components/           VehicleHero, VehicleViewer, ConfiguratorPanel, ColorSelector, WheelSelector,
                        ConfigurationSummary, PerformanceSpecs, EnergySection, ModelComparison, …
  pages/                HomePage, ConfigurePage, ModelsPage, TechnologyPage, ProjectPage
  admin/                local-only admin (dev server only)
```

Configuration logic is kept out of the components: the UI calls `select`, `setModel`, `togglePackage`, `reset` and `save`, and reads `pricing` and `parts`.

## Performance

- Three.js is split into its own chunk and loads only when a 3D view comes near the screen.
- Rendering runs on demand: it stops when nothing moves, when the canvas is off-screen and when the tab is hidden. Pixel ratio is capped.
- Phones see a lightweight 2D drawing in the hero; 3D loads in the showcase and configurator.
- Browsers without WebGL get the 2D drawing everywhere, so every feature keeps working.
- Media slots reserve their aspect ratio (no layout shift), images are lazy-loaded WebP with two sizes, and background videos only play on larger screens while visible.

## Accessibility

Semantic landmarks and headings, a skip link, native radio and checkbox inputs for every option (full keyboard support), visible focus, selected states shown with text and icons (not colour alone), a polite live region for price changes, keyboard-accessible hotspots and gallery (arrows and Escape), and `prefers-reduced-motion` support (no smooth scrolling, pinning or scrubbed animation).

## Images and videos

Every photo or video spot is a slot in `src/data/media.json` with alt text and a full AI prompt. Until a file is added, the slot shows original animated artwork drawn in code. To add media, run `npm run dev`, open `/#/admin` → **Images & videos**, copy a prompt, generate the image or video, and upload it. Images are converted to WebP (2000px and 900px); videos are saved to `public/media/videos/`. All prompts are listed in [`docs/MEDIA_PROMPTS.md`](docs/MEDIA_PROMPTS.md).

## Local admin

Edit models and specifications, paint colours, wheels, interiors, packages, site text and media. It exists only under `npm run dev` (the route is removed from production builds), its API is a Vite dev-server plugin that only answers `localhost`, and each save backs up the previous file to `.admin-backups/` (git-ignored). The 3D shape parameters, charging curve and diagram positions stay in the JSON files.

```bash
git add -A
git commit -m "Update content"
git push
```

## Deploying

**GitHub Pages (included).** `.github/workflows/deploy.yml` builds and deploys on every push to `main`. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**. Relative asset paths and hash routes make it work at `https://<user>.github.io/<repo>/`.

**Cloudflare Pages or Vercel.** Framework preset Vite, build command `npm run build`, output directory `dist`. No environment variables.

## Asset inventory and licences

| Asset | Source | Licence |
| --- | --- | --- |
| 3D car, 2D drawings, placeholder artwork, icons in the favicon | Created for this project in code | Original |
| Three.js, Vue, Vue Router, Vite, Lenis | npm | MIT |
| GSAP and plugins | npm | GSAP standard licence (free, including bonus plugins since 3.13) |
| Lucide icons | npm | ISC |
| Archivo, JetBrains Mono | Fontsource (self-hosted) | SIL Open Font License 1.1 |
| Photos and videos you add | Your generator or stock source | Record each credit in the admin; it appears on the Project page |

## Real vs. simulated

Real: interaction techniques, general EV concepts (800-volt systems, charging curves, heat pumps). Simulated: the brand, models, every figure and price, the 3D car, and all configurations (nothing is ordered, reserved or sent).
