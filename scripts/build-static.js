import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src', 'site');
const publicDir = path.join(rootDir, 'public');
const srcImages = path.join(srcDir, 'images');
const pubImages = path.join(publicDir, 'images');

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

async function build() {
  try {
    ensureDirExists(publicDir);
    ensureDirExists(pubImages);

    console.log('Minifying CSS and JS...');
    esbuild.buildSync({
      entryPoints: [path.join(srcDir, 'styles.css')],
      outfile: path.join(publicDir, 'styles.css'),
      minify: true,
      charset: 'ascii',
    });
    esbuild.buildSync({
      entryPoints: [path.join(srcDir, 'script.js')],
      outfile: path.join(publicDir, 'script.js'),
      minify: true,
      charset: 'ascii',
    });

    console.log('Copying HTML files...');
    fs.copyFileSync(path.join(srcDir, 'site.html'),         path.join(publicDir, 'site.html'));
    fs.copyFileSync(path.join(srcDir, 'site.html'),         path.join(publicDir, 'index.html'));
    fs.copyFileSync(path.join(srcDir, '404.html'),          path.join(publicDir, '404.html'));
    fs.copyFileSync(path.join(srcDir, 'privacy.html'),      path.join(publicDir, 'privacy.html'));
    fs.copyFileSync(path.join(srcDir, 'services.html'),     path.join(publicDir, 'services.html'));
    fs.copyFileSync(path.join(srcDir, 'booking-guide.html'),path.join(publicDir, 'booking-guide.html'));

    console.log('Copying SEO files...');
    fs.copyFileSync(path.join(srcDir, 'sitemap.xml'), path.join(publicDir, 'sitemap.xml'));
    fs.copyFileSync(path.join(srcDir, 'robots.txt'),  path.join(publicDir, 'robots.txt'));

    console.log('Copying images to public/images/...');
    const imageFiles = [
      'aymen.pro.webp',
      'b-logo.jpg',
      'favicon.png',
      'apple-touch-icon.png',
      'logo.dark.webp',
      'logo.light.webp',
      'og-image.jpg',
      'classic-massage-new.jpg',
      'master-massage.webp',
      'sport-massage.webp',
      'cabinet.webp',
      'plasa.jpg',
    ];
    for (const img of imageFiles) {
      copyIfExists(path.join(srcImages, img), path.join(pubImages, img));
    }

    // Also copy favicon.png to root for browser default lookup
    copyIfExists(path.join(srcImages, 'favicon.png'),         path.join(publicDir, 'favicon.png'));
    copyIfExists(path.join(srcImages, 'apple-touch-icon.png'),path.join(publicDir, 'apple-touch-icon.png'));

    console.log('Checking for sharp to generate JPEG fallback images...');
    try {
      const sharpModule = await import('sharp');
      const sharp = sharpModule.default || sharpModule;

      const portraitWebP = path.join(srcImages, 'portrait.webp');
      if (fs.existsSync(portraitWebP)) {
        await sharp(portraitWebP).jpeg({ quality: 85 }).toFile(path.join(pubImages, 'portrait.jpg'));
        console.log('Generated portrait.jpg fallback.');
      }
    } catch (err) {
      console.warn('sharp not available. Skipping JPEG fallback:', err.message);
    }

    console.log('Static site build complete.');
  } catch (error) {
    console.error('Error during build:', error);
    process.exit(1);
  }
}

build();
