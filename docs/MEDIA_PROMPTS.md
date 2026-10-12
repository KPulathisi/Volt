# VOLT media prompts

Generated from `src/data/media.json` (19 slots, 0 uploaded). Run `npm run prompts` after editing prompts.

Every slot shows an animated illustration until a real file is added. The easiest route is the local admin
(`npm run dev`, then open `/#/admin` → Images & videos): copy a prompt, generate the image or video in your tool of choice,
and upload it. The admin converts images to WebP and fills in `media.json` for you.

Tips

- Keep the same style suffix on every prompt so the set feels like one shoot, and describe the car the same way each time.
- Never include real car brands, badges or licence plates.
- Check the licence of the generator or stock source you use and record it in the slot's **Credit** field; credits appear on the Project page.
- Avoid real logos, readable signage and identifiable faces.
- Each video has a separate still "poster" slot, used on phones and with reduced motion.

## Videos (1)

### In motion (full-width video band)

- Slot: `film-video` · video · aspect 21/9 · placeholder
- Alt text: The VOLT ONE gliding along an empty coastal road at dusk.
- Save as: `public/media/videos/film-video.mp4` (H.264, 1920×1080 or smaller, 8–12 s loop, no audio, ideally under 15 MB)

```text
Cinematic tracking shot alongside a sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in graphite, gliding along an empty coastal highway at blue hour. Low camera, light bar glowing white, wet asphalt reflections, gentle motion blur on the road. 8–12 seconds, slow steady camera, seamless loop, no cuts. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

## Images (18)

### In motion (still for phones)

- Slot: `film-poster` · image · aspect 21/9 · placeholder
- Alt text: The VOLT ONE on an empty coastal road at dusk.
- Save as: upload in the admin, or export `public/media/film-poster.webp` (2000px wide) and `public/media/film-poster-sm.webp` (900px wide)

```text
Wide low-angle shot of a sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in graphite, driving along an empty coastal highway at blue hour, light bar glowing, wet asphalt reflections. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Story 01: exterior

- Slot: `story-exterior` · image · aspect 4/5 · placeholder
- Alt text: Side profile of the VOLT ONE in a dark studio, one long line from nose to tail.
- Save as: upload in the admin, or export `public/media/story-exterior.webp` (2000px wide) and `public/media/story-exterior-sm.webp` (900px wide)

```text
Pure side profile of a sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in liquid silver, in a black studio. A single long overhead softbox draws one bright reflection line along the whole shoulder from nose to tail. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Story 02: aerodynamics

- Slot: `story-aero` · image · aspect 4/5 · placeholder
- Alt text: Smoke lines flowing over the VOLT ONE in a wind tunnel.
- Save as: upload in the admin, or export `public/media/story-aero.webp` (2000px wide) and `public/media/story-aero-sm.webp` (900px wide)

```text
A sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in matte stealth grey, inside a dark wind tunnel. Thin white smoke streams flow smoothly over the bonnet, roof and tail. Side view, slightly from above. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Story 03: lighting

- Slot: `story-lighting` · image · aspect 4/5 · placeholder
- Alt text: Close-up of the thin full-width front light bar glowing in the dark.
- Save as: upload in the admin, or export `public/media/story-lighting.webp` (2000px wide) and `public/media/story-lighting-sm.webp` (900px wide)

```text
Extreme close-up, front three-quarter view, of the nose of a sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in obsidian black, at night. The razor-thin full-width white light bar is the only light source, reflecting on the wet ground. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Story 04: interior

- Slot: `story-interior` · image · aspect 4/5 · placeholder
- Alt text: A calm, minimal cabin with a low dashboard and light leather seats.
- Save as: upload in the admin, or export `public/media/story-interior.webp` (2000px wide) and `public/media/story-interior-sm.webp` (900px wide)

```text
Interior of a fictional premium electric car: a low, wide minimalist dashboard with a slim floating 15-inch screen, a flat floor, light ivory vegan leather seats with fine lime stitching, open-pore grey oak trim and a full glass roof. Soft daylight, calm and quiet mood. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Story 05: driver interface

- Slot: `story-interface` · image · aspect 4/5 · placeholder
- Alt text: Driver's view with a head-up display projected onto the windscreen at night.
- Save as: upload in the admin, or export `public/media/story-interface.webp` (2000px wide) and `public/media/story-interface-sm.webp` (900px wide)

```text
Driver's point of view inside a fictional electric car at night on a city highway: a minimal head-up display projects speed and a navigation arrow onto the windscreen in white and lime. A thin steering wheel and slim screen are softly lit. Shallow depth of field, city lights bokeh. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Gallery: front three-quarter

- Slot: `gallery-1` · image · aspect 3/2 · placeholder
- Alt text: Front three-quarter view of the VOLT ONE in Volt Lime.
- Save as: upload in the admin, or export `public/media/gallery-1.webp` (2000px wide) and `public/media/gallery-1-sm.webp` (900px wide)

```text
Front three-quarter view of a sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, painted in a signature electric lime, on a dark reflective studio floor with a soft overhead light. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Gallery: rear light

- Slot: `gallery-2` · image · aspect 3/2 · placeholder
- Alt text: The full-width rear light bar of the VOLT ONE at night.
- Save as: upload in the admin, or export `public/media/gallery-2.webp` (2000px wide) and `public/media/gallery-2-sm.webp` (900px wide)

```text
Rear three-quarter view of a sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in graphite, at night in an empty concrete car park. A full-width thin red rear light bar glows and reflects on the wet floor. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Gallery: wheel detail

- Slot: `gallery-3` · image · aspect 3/2 · placeholder
- Alt text: Close-up of a covered aero wheel.
- Save as: upload in the admin, or export `public/media/gallery-3.webp` (2000px wide) and `public/media/gallery-3-sm.webp` (900px wide)

```text
Macro close-up of a 20-inch covered aerodynamic alloy wheel on a fictional electric car, gloss silver with smooth flush covers and low-profile tyre, dark studio, crisp rim light. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Gallery: seats

- Slot: `gallery-4` · image · aspect 3/2 · placeholder
- Alt text: Close-up of cognac leather seats.
- Save as: upload in the admin, or export `public/media/gallery-4.webp` (2000px wide) and `public/media/gallery-4-sm.webp` (900px wide)

```text
Close-up of the front seats of a fictional premium electric car in cognac semi-aniline leather with walnut trim, minimal design, soft window light. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Gallery: display

- Slot: `gallery-5` · image · aspect 3/2 · placeholder
- Alt text: A slim floating screen above a low dashboard.
- Save as: upload in the admin, or export `public/media/gallery-5.webp` (2000px wide) and `public/media/gallery-5-sm.webp` (900px wide)

```text
Close-up of a slim floating 15-inch touchscreen above a low wide dashboard in a fictional electric car, showing a minimal dark map interface with a lime route line, soft ambient light. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Gallery: charging at night

- Slot: `gallery-6` · image · aspect 3/2 · placeholder
- Alt text: The VOLT ONE charging at a quiet station at night.
- Save as: upload in the admin, or export `public/media/gallery-6.webp` (2000px wide) and `public/media/gallery-6-sm.webp` (900px wide)

```text
A sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in arctic white, plugged into a minimal fast-charging post at a quiet station at night. The light bar pulses softly in lime to show charge level. Cool overhead light, wet ground. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Energy: charging

- Slot: `energy-charge` · image · aspect 16/9 · placeholder
- Alt text: A charging cable plugged into the side of the car at night.
- Save as: upload in the admin, or export `public/media/energy-charge.webp` (2000px wide) and `public/media/energy-charge-sm.webp` (900px wide)

```text
Close-up of a charging cable plugged into the flush charging port on the rear wing of a fictional electric car at night, small lime status light, shallow depth of field, cool tones. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Models: VOLT ONE

- Slot: `model-one` · image · aspect 16/9 · placeholder
- Alt text: The VOLT ONE fastback in a dark studio.
- Save as: upload in the admin, or export `public/media/model-one.webp` (2000px wide) and `public/media/model-one-sm.webp` (900px wide)

```text
Side three-quarter studio shot of a sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in graphite, on a black reflective floor. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Models: VOLT TOURING

- Slot: `model-touring` · image · aspect 16/9 · placeholder
- Alt text: The VOLT TOURING shooting brake in a dark studio.
- Save as: upload in the admin, or export `public/media/model-touring.webp` (2000px wide) and `public/media/model-touring-sm.webp` (900px wide)

```text
Side three-quarter studio shot of a sleek electric shooting brake (long-roof estate) with a thin full-width light bar, blacked-out glass cabin and covered aero wheels, in deep blue metallic, on a black reflective floor. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Models: VOLT PERFORMANCE

- Slot: `model-performance` · image · aspect 16/9 · placeholder
- Alt text: The VOLT PERFORMANCE coupe in a dark studio.
- Save as: upload in the admin, or export `public/media/model-performance.webp` (2000px wide) and `public/media/model-performance-sm.webp` (900px wide)

```text
Side three-quarter studio shot of a low, wide two-door electric coupé with a thin full-width light bar, a fixed carbon rear wing, forged black wheels and lime brake calipers, in ember orange, on a black reflective floor. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Final call to action (full width)

- Slot: `cta-image` · image · aspect 21/9 · placeholder
- Alt text: The VOLT ONE on a wet road at night with its light bar glowing.
- Save as: upload in the admin, or export `public/media/cta-image.webp` (2000px wide) and `public/media/cta-image-sm.webp` (900px wide)

```text
Dramatic ultra-wide shot of a sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in obsidian black, parked on a wet road at night under a single streetlight. Light bar glowing white, long reflections, dark sky, lots of negative space on the left for text. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```

### Project page

- Slot: `about-image` · image · aspect 16/9 · placeholder
- Alt text: The VOLT ONE under a single studio light.
- Save as: upload in the admin, or export `public/media/about-image.webp` (2000px wide) and `public/media/about-image-sm.webp` (900px wide)

```text
Moody top-down three-quarter shot of a sleek, low electric fastback saloon with a single thin full-width light bar across the nose, a blacked-out glass cabin that looks like one piece, flush door handles, smooth unbroken body surfaces and covered aero wheels, in liquid silver, under a single round studio light in darkness. Photorealistic automotive photography of a fictional electric car with no real brand, no logos, no badges and no licence plates. Dark graphite studio or night setting, controlled soft light with crisp reflections, subtle film grain, colour palette of black, graphite and white with a restrained electric lime accent. No text, no watermarks, no people facing the camera.
```
