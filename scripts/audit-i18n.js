import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src', 'site');

// Read script.js and extract keys from translations.fi and translations.en
const jsContent = fs.readFileSync(path.join(srcDir, 'script.js'), 'utf8');

// Match keys inside fi: { ... } and en: { ... }
const fiMatch = jsContent.match(/fi:\s*\{([^}]+)\}/s);
const enMatch = jsContent.match(/en:\s*\{([^}]+)\}/s);

function extractKeys(block) {
  const keys = new Set();
  const regex = /['"]([^'"]+)['"]\s*:/g;
  let m;
  while ((m = regex.exec(block)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

const fiKeys = fiMatch ? extractKeys(fiMatch[1]) : new Set();
const enKeys = enMatch ? extractKeys(enMatch[1]) : new Set();

// Extract all data-i18n attributes from HTML files
const htmlFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));
const htmlKeys = new Map(); // key -> list of files

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(srcDir, file), 'utf8');
  const regex = /data-i18n="([^"]+)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const key = m[1];
    if (!htmlKeys.has(key)) htmlKeys.set(key, []);
    htmlKeys.get(key).push(file);
  }
}

console.log('\n🔍 I18N AUDIT REPORT:');
console.log('--------------------------------------------------');
let missingCount = 0;

for (const [key, files] of htmlKeys.entries()) {
  const inFi = fiKeys.has(key);
  const inEn = enKeys.has(key);

  if (!inFi || !inEn) {
    missingCount++;
    console.log(`❌ Key "${key}" (used in ${files.join(', ')})`);
    if (!inFi) console.log(`   - Missing in FI dictionary`);
    if (!inEn) console.log(`   - Missing in EN dictionary`);
  }
}

if (missingCount === 0) {
  console.log('✅ ALL data-i18n keys in HTML files exist in both FI and EN dictionaries!');
} else {
  console.log(`\n⚠️ Total missing keys: ${missingCount}`);
}
