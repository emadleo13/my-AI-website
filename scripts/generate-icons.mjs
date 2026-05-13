import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'public', 'BLUE AI.png');
const outDir = join(root, 'public', 'icons');

mkdirSync(outDir, { recursive: true });

const sizes = [
  { name: 'icon-32.png', size: 32 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(src).resize(size, size, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 1 } }).png().toFile(join(outDir, name));
  console.log(`✓ ${name}`);
}

// favicon.ico (32px PNG works as favicon in modern browsers)
await sharp(src).resize(32, 32, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 1 } }).png().toFile(join(root, 'public', 'favicon.png'));
console.log('✓ favicon.png');
