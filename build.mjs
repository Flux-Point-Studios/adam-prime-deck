import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { officeSvg } from './src/office.mjs';
import { ISO_CSS } from './src/anatomy/iso-kit.mjs';

await mkdir('docs', { recursive: true });
const template = await readFile('src/deck.html', 'utf8');
const html = template.replace('{{OFFICE_HERO}}', officeSvg('office-hero')).replace('{{OFFICE_TEAM}}', officeSvg('office-team'));
if (html.includes('{{')) throw new Error('Unresolved deck template');
await writeFile('docs/index.html', html);
await writeFile('docs/anatomy.css', ISO_CSS);
await copyFile('src/anatomy/LICENSE', 'docs/anatomy-license.txt');
await Promise.all(['styles.css', 'app.mjs', 'model.mjs'].map(file => copyFile(`src/${file}`, `docs/${file}`)));
await writeFile('docs/favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f5f2eb"/><text x="12" y="48" font-family="Georgia" font-size="59" font-weight="bold" fill="#292925">a</text><circle cx="50" cy="45" r="5" fill="#c44c2b"/></svg>');
console.log('Built 5-slide ADAM deck with two Anatomy office figures.');
