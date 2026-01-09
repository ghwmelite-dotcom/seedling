/**
 * PWA Screenshot Generator for Seedling
 * Captures actual screenshots from the deployed app
 *
 * Run: node scripts/generate-screenshots.js
 */

import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const APP_URL = 'https://seedling-1m8.pages.dev';
const outputDir = join(__dirname, '../public/screenshots');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function optimizeImage(inputPath, outputPath, quality = 80) {
  await sharp(inputPath)
    .png({ quality, compressionLevel: 9 })
    .toFile(outputPath + '.tmp');

  // Replace original with optimized
  unlinkSync(inputPath);
  const fs = await import('fs/promises');
  await fs.rename(outputPath + '.tmp', outputPath);
}

async function waitForPageLoad(page, url, timeout = 10000) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(resolve => setTimeout(resolve, timeout));
}

async function generateScreenshots() {
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    // Desktop Screenshot (1280x720)
    console.log('\nCapturing desktop screenshot...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

    await waitForPageLoad(desktopPage, APP_URL, 8000);

    const desktopPath = join(outputDir, 'desktop.png');
    await desktopPage.screenshot({
      path: desktopPath,
      type: 'png',
    });
    await optimizeImage(desktopPath, desktopPath);
    console.log('Saved & optimized: desktop.png (1280x720)');

    // Desktop Wide Screenshot (1920x1080)
    console.log('\nCapturing desktop wide screenshot...');
    await desktopPage.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const desktopWidePath = join(outputDir, 'desktop-wide.png');
    await desktopPage.screenshot({
      path: desktopWidePath,
      type: 'png',
    });
    await optimizeImage(desktopWidePath, desktopWidePath);
    console.log('Saved & optimized: desktop-wide.png (1920x1080)');

    await desktopPage.close();

    // Mobile Screenshot (390x844 - iPhone 14 Pro) - use deviceScaleFactor 1 for smaller file
    console.log('\nCapturing mobile screenshot...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });

    await waitForPageLoad(mobilePage, APP_URL, 8000);

    const mobilePath = join(outputDir, 'mobile.png');
    await mobilePage.screenshot({
      path: mobilePath,
      type: 'png',
    });
    await optimizeImage(mobilePath, mobilePath);
    console.log('Saved & optimized: mobile.png (390x844)');

    await mobilePage.close();

    // Tablet Screenshot (768x1024 - iPad) - use deviceScaleFactor 1 for smaller file
    console.log('\nCapturing tablet screenshot...');
    const tabletPage = await browser.newPage();
    await tabletPage.setViewport({
      width: 768,
      height: 1024,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });

    await waitForPageLoad(tabletPage, APP_URL, 8000);

    const tabletPath = join(outputDir, 'tablet.png');
    await tabletPage.screenshot({
      path: tabletPath,
      type: 'png',
    });
    await optimizeImage(tabletPath, tabletPath);
    console.log('Saved & optimized: tablet.png (768x1024)');

    await tabletPage.close();

    console.log('\n✨ All screenshots generated and optimized!');
    console.log(`\nScreenshots saved to: ${outputDir}`);

  } catch (error) {
    console.error('Error generating screenshots:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

generateScreenshots().catch((error) => {
  console.error('Failed to generate screenshots:', error.message);
  process.exit(1);
});
