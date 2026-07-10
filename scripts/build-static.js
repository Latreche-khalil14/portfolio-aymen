import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src', 'site');
const publicDir = path.join(rootDir, 'public');

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function build() {
  try {
    ensureDirExists(publicDir);

    console.log('Minifying CSS and JS...');
    // Minify styles.css
    esbuild.buildSync({
      entryPoints: [path.join(srcDir, 'styles.css')],
      outfile: path.join(publicDir, 'styles.css'),
      minify: true,
    });

    // Minify script.js
    esbuild.buildSync({
      entryPoints: [path.join(srcDir, 'script.js')],
      outfile: path.join(publicDir, 'script.js'),
      minify: true,
    });

    console.log('Copying HTML files...');
    fs.copyFileSync(path.join(srcDir, 'site.html'), path.join(publicDir, 'site.html'));
    fs.copyFileSync(path.join(srcDir, 'site.html'), path.join(publicDir, 'index.html')); // Vercel root entry
    fs.copyFileSync(path.join(srcDir, '404.html'), path.join(publicDir, '404.html'));
    fs.copyFileSync(path.join(srcDir, 'privacy.html'), path.join(publicDir, 'privacy.html'));
    fs.copyFileSync(path.join(srcDir, 'services.html'), path.join(publicDir, 'services.html'));
    fs.copyFileSync(path.join(srcDir, 'booking-guide.html'), path.join(publicDir, 'booking-guide.html'));

    console.log('Copying favicon...');
    fs.copyFileSync(path.join(srcDir, 'favicon.svg'), path.join(publicDir, 'favicon.svg'));

    console.log('Copying logo variants...');
    fs.copyFileSync(path.join(srcDir, 'logo.light.jpg'), path.join(publicDir, 'logo.light.jpg'));
    fs.copyFileSync(path.join(srcDir, 'logo.dark.jpg'),  path.join(publicDir, 'logo.dark.jpg'));

    console.log('Copying service images...');
    fs.copyFileSync(path.join(srcDir, 'sports_massage.png'), path.join(publicDir, 'sports_massage.png'));
    fs.copyFileSync(path.join(srcDir, 'masseter_massage.png'), path.join(publicDir, 'masseter_massage.png'));
    fs.copyFileSync(path.join(srcDir, 'classic_massage.png'), path.join(publicDir, 'classic_massage.png'));

    console.log('Checking for sharp to generate JPEG fallback images...');
    try {
      const sharpModule = await import('sharp');
      const sharp = sharpModule.default || sharpModule;

      const portraitWebP = path.join(publicDir, 'portrait.webp');
      const portraitJpg = path.join(publicDir, 'portrait.jpg');
      if (fs.existsSync(portraitWebP)) {
        if (fs.existsSync(portraitJpg)) {
          fs.unlinkSync(portraitJpg);
        }
        await sharp(portraitWebP).jpeg({ quality: 85 }).toFile(portraitJpg);
        console.log('Generated portrait.jpg fallback.');
      }

      const aboutWebP = path.join(publicDir, 'about.webp');
      const aboutJpg = path.join(publicDir, 'about.jpg');
      if (fs.existsSync(aboutWebP)) {
        if (fs.existsSync(aboutJpg)) {
          fs.unlinkSync(aboutJpg);
        }
        await sharp(aboutWebP).jpeg({ quality: 85 }).toFile(aboutJpg);
        console.log('Generated about.jpg fallback.');
      }
    } catch (err) {
      console.warn('sharp is not available yet. Skipping JPEG fallback generation. Reason:', err.message);
    }

    console.log('Static site build complete.');
  } catch (error) {
    console.error('Error during static site build:', error);
    process.exit(1);
  }
}

build();
