import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src', 'site');

// ── 1. Extract all CSS class selectors from styles.css ──────────────────────
const cssContent = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf8');

// Match .classname followed by space, comma, colon, {, (, or end
const cssClassRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)(?=[\s,:{(>+~\[])/g;
const definedClasses = new Set();
let m;
while ((m = cssClassRegex.exec(cssContent)) !== null) {
  definedClasses.add(m[1]);
}

// ── 2. Extract all classes used in HTML files ────────────────────────────────
const htmlFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));
const usedClasses = new Set();

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(srcDir, file), 'utf8');
  // Match class="..." attributes
  const classAttrRegex = /class="([^"]+)"/g;
  while ((m = classAttrRegex.exec(html)) !== null) {
    m[1].trim().split(/\s+/).forEach(c => usedClasses.add(c));
  }
}

// ── 3. Extract classes used in script.js ─────────────────────────────────────
const jsContent = fs.readFileSync(path.join(srcDir, 'script.js'), 'utf8');
// classList.add/toggle/contains/remove('class') or className = 'class'
const jsClassRegex = /classList\.(?:add|toggle|contains|remove)\(\s*['"`]([a-zA-Z][a-zA-Z0-9_-]+)['"`]/g;
while ((m = jsClassRegex.exec(jsContent)) !== null) {
  usedClasses.add(m[1]);
}
// Also catch string literals that look like class names added dynamically
const jsStringRegex = /['"`]((?:[a-zA-Z][a-zA-Z0-9_-]+\s*)+)['"`]/g;
while ((m = jsStringRegex.exec(jsContent)) !== null) {
  m[1].trim().split(/\s+/).forEach(c => {
    if (definedClasses.has(c)) usedClasses.add(c);
  });
}

// ── 4. Compare and report ─────────────────────────────────────────────────────
const unused = [...definedClasses].filter(c => !usedClasses.has(c)).sort();
const used   = [...definedClasses].filter(c =>  usedClasses.has(c)).sort();

console.log(`\n📊 CSS AUDIT REPORT`);
console.log(`${'─'.repeat(50)}`);
console.log(`✅ Total CSS classes defined : ${definedClasses.size}`);
console.log(`✅ Classes used in HTML/JS   : ${used.length}`);
console.log(`⚠️  Potentially unused        : ${unused.length}`);
console.log(`\n🔍 UNUSED CSS CLASSES (${unused.length}):`);
console.log(`${'─'.repeat(50)}`);
unused.forEach(c => console.log(`  .${c}`));

console.log(`\n✅ USED CSS CLASSES (${used.length}):`);
console.log(`${'─'.repeat(50)}`);
used.forEach(c => console.log(`  .${c}`));
