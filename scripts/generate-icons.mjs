import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'public', 'BLUE AI.png');
const outDir = join(root, 'public', 'icons');

mkdirSync(outDir, { recursive: true });

// trim() removes surrounding black/dark borders, then resize with transparent background
const sizes = [
  { name: 'icon-32.png', size: 32 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(src)
    .trim({ background: '#000000', threshold: 30 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(outDir, name));
  console.log(`✓ ${name}`);
}

await sharp(src)
  .trim({ background: '#000000', threshold: 30 })
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(join(root, 'public', 'favicon.png'));
console.log('✓ favicon.png');
