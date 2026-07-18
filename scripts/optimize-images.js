import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcImagesDir = path.join(rootDir, 'src', 'site', 'images');

async function optimize() {
  console.log('Starting image optimization in src/site/images...');

  const images = [
    { file: 'classic_massage.png', format: 'webp', q: 80 },
    { file: 'masseter_massage.png', format: 'webp', q: 80 },
    { file: 'sports_massage.png', format: 'webp', q: 80 },
    
    { file: 'logo.dark.jpg', format: 'webp', q: 80 },
    { file: 'logo.light.jpg', format: 'webp', q: 80 },
    { file: 'aymen.pro.jpeg', format: 'webp', q: 80 },

    // Also produce highly optimized JPEGs as compressed fallbacks
    { file: 'logo.dark.jpg', format: 'jpeg', q: 80, suffix: '_opt' },
    { file: 'logo.light.jpg', format: 'jpeg', q: 80, suffix: '_opt' },
    { file: 'aymen.pro.jpeg', format: 'jpeg', q: 80, suffix: '_opt' }
  ];

  for (const img of images) {
    const srcPath = path.join(srcImagesDir, img.file);
    if (!fs.existsSync(srcPath)) {
      console.log(`Skipping missing image: ${img.file}`);
      continue;
    }

    const ext = path.extname(img.file);
    const base = path.basename(img.file, ext);
    const suffix = img.suffix || '';
    const destName = `${base}${suffix}.${img.format}`;
    const destPath = path.join(srcImagesDir, destName);

    console.log(`Processing: ${img.file} -> ${destName}`);
    
    if (img.format === 'webp') {
      await sharp(srcPath)
        .webp({ quality: img.q })
        .toFile(destPath);
    } else if (img.format === 'jpeg') {
      await sharp(srcPath)
        .jpeg({ quality: img.q, progressive: true })
        .toFile(destPath);
    }
  }

  console.log('Image optimization completed successfully.');
}

optimize().catch(err => {
  console.error('Error during image optimization:', err);
  process.exit(1);
});
