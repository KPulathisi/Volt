// Regenerates docs/MEDIA_PROMPTS.md from src/data/media.json:  npm run prompts
import fs from 'node:fs'

const media = JSON.parse(fs.readFileSync(new URL('../src/data/media.json', import.meta.url), 'utf8'))
const videos = media.filter((m) => m.kind === 'video')
const images = media.filter((m) => m.kind === 'image')
const done = media.filter((m) => m.file).length

const block = (m) => [
  `### ${m.label}`,
  '',
  `- Slot: \`${m.id}\` · ${m.kind} · aspect ${m.aspect}${m.file ? ' · **uploaded**' : ' · placeholder'}`,
  `- Alt text: ${m.alt}`,
  m.kind === 'video'
    ? `- Save as: \`public/media/videos/${m.id}.mp4\` (H.264, 1920×1080 or smaller, 8–12 s loop, no audio, ideally under 15 MB)`
    : `- Save as: upload in the admin, or export \`public/media/${m.id}.webp\` (2000px wide) and \`public/media/${m.id}-sm.webp\` (900px wide)`,
  '',
  '```text',
  m.prompt,
  '```',
  ''
].join('\n')

const out = [
  '# VOLT media prompts',
  '',
  `Generated from \`src/data/media.json\` (${media.length} slots, ${done} uploaded). Run \`npm run prompts\` after editing prompts.`,
  '',
  'Every slot shows an animated illustration until a real file is added. The easiest route is the local admin',
  '(`npm run dev`, then open `/#/admin` → Images & videos): copy a prompt, generate the image or video in your tool of choice,',
  'and upload it. The admin converts images to WebP and fills in `media.json` for you.',
  '',
  'Tips',
  '',
  '- Keep the same style suffix on every prompt so the set feels like one shoot, and describe the car the same way each time.',
  '- Never include real car brands, badges or licence plates.',
  '- Check the licence of the generator or stock source you use and record it in the slot\'s **Credit** field; credits appear on the Project page.',
  '- Avoid real logos, readable signage and identifiable faces.',
  '- Each video has a separate still "poster" slot, used on phones and with reduced motion.',
  '',
  `## Videos (${videos.length})`,
  '',
  ...videos.map(block),
  `## Images (${images.length})`,
  '',
  ...images.map(block)
].join('\n')

fs.mkdirSync(new URL('../docs/', import.meta.url), { recursive: true })
fs.writeFileSync(new URL('../docs/MEDIA_PROMPTS.md', import.meta.url), out)
console.log(`docs/MEDIA_PROMPTS.md written (${media.length} slots)`)
