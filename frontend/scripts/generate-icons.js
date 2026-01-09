/**
 * PWA Icon Generator for Seedling
 * Generates all required PWA icon sizes from the base SVG
 *
 * Run: node scripts/generate-icons.js
 * Requires: npm install sharp
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = join(__dirname, '../public/icons/icon.svg');
const outputDir = join(__dirname, '../public/icons');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons...');

  const svgBuffer = readFileSync(inputSvg);

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(__dirname, '../public/apple-touch-icon.png'));
  console.log('Generated: apple-touch-icon.png');

  // Generate favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(__dirname, '../public/favicon-32x32.png'));
  console.log('Generated: favicon-32x32.png');

  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(join(__dirname, '../public/favicon-16x16.png'));
  console.log('Generated: favicon-16x16.png');

  // Generate shortcut icons
  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile(join(outputDir, 'shortcut-simulate.png'));
  console.log('Generated: shortcut-simulate.png');

  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile(join(outputDir, 'shortcut-analytics.png'));
  console.log('Generated: shortcut-analytics.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
