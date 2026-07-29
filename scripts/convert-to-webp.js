import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '..', 'src', 'site', 'images');

async function convertPngToWebp() {
  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') && f !== 'favicon.png' && f !== 'apple-touch-icon.png');

  if (files.length === 0) {
    console.log('⚠️  No PNG files found to convert (favicon.png and apple-touch-icon.png are kept as PNG).');
    return;
  }

  console.log(`🔄 Found ${files.length} PNG file(s) to convert:\n`);

  for (const file of files) {
    const inputPath  = path.join(imagesDir, file);
    const outputName = file.replace('.png', '.webp');
    const outputPath = path.join(imagesDir, outputName);

    const inputSize = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);

    const outputSize = fs.statSync(outputPath).size;
    const savings = (((inputSize - outputSize) / inputSize) * 100).toFixed(1);

    console.log(`  ✅ ${file} → ${outputName}`);
    console.log(`     ${(inputSize/1024).toFixed(0)} KB → ${(outputSize/1024).toFixed(0)} KB  (saved ${savings}%)\n`);

    // Delete original PNG after successful conversion
    fs.unlinkSync(inputPath);
    console.log(`  🗑️  Deleted original: ${file}\n`);
  }

  console.log('🎉 All PNGs converted to WebP successfully!');
}

convertPngToWebp().catch(console.error);
