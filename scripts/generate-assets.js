const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function run() {
  const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-unma.png');
  const logoBuffer = fs.readFileSync(logoPath);

  // 1. Generate Favicons and App Icons in app/ and public/
  await sharp(logoBuffer).resize(64, 64).png().toFile(path.join(process.cwd(), 'app', 'icon.png'));
  await sharp(logoBuffer).resize(180, 180).png().toFile(path.join(process.cwd(), 'app', 'apple-icon.png'));
  await sharp(logoBuffer).resize(32, 32).png().toFile(path.join(process.cwd(), 'app', 'favicon.ico'));
  await sharp(logoBuffer).resize(32, 32).png().toFile(path.join(process.cwd(), 'public', 'favicon.ico'));
  await sharp(logoBuffer).resize(48, 48).png().toFile(path.join(process.cwd(), 'public', 'favicon.png'));
  console.log('Favicons and app icons created successfully.');

  // 2. High-Res 1200x630 OpenGraph Image
  const svgBanner = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0000a3" />
          <stop offset="45%" stop-color="#0000ff" />
          <stop offset="100%" stop-color="#00103a" />
        </linearGradient>
        <radialGradient id="glow" cx="15%" cy="30%" r="55%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)" />
      <rect width="1200" height="630" fill="url(#glow)" />
      
      <!-- Decorative Circular Lines -->
      <circle cx="1080" cy="110" r="320" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
      <circle cx="1080" cy="110" r="230" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" />
      <circle cx="120" cy="540" r="220" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" />
      
      <!-- Right Glassmorphism Card -->
      <rect x="520" y="80" width="610" height="470" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
      
      <!-- Eyebrow Badge -->
      <rect x="560" y="125" width="230" height="34" rx="17" fill="#ffffff" />
      <text x="675" y="147" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0000ff" text-anchor="middle" letter-spacing="1.2">SURVEI SISWA 2026</text>
      
      <!-- Title -->
      <text x="560" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" fill="#ffffff" letter-spacing="-0.8">
        <tspan x="560" dy="0">Peminatan Studi ke</tspan>
        <tspan x="560" dy="48">Perguruan Tinggi</tspan>
      </text>
      
      <!-- Subtitle & University Name -->
      <text x="560" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="800" fill="#ffd166">Universitas Majalengka</text>
      
      <text x="560" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#e2e8f0">Pusat Penerimaan &amp; Informasi Studi Siswa</text>
      <text x="560" y="408" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#cbd5e1">Rencanakan masa depan pendidikan tinggi Anda bersama UNMA</text>

      <!-- Bernas Berkualitas Badge -->
      <rect x="560" y="445" width="220" height="40" rx="12" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.25)" />
      <text x="670" y="470" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">✦ BERNAS BERKUALITAS</text>
    </svg>
  `);

  // Resize logo for left side
  const logoResized = await sharp(logoBuffer)
    .resize(360, 360, { fit: 'contain' })
    .toBuffer();

  // Composite background with logo
  await sharp(svgBanner)
    .composite([
      {
        input: logoResized,
        top: 135,
        left: 90,
      }
    ])
    .png()
    .toFile(path.join(process.cwd(), 'app', 'opengraph-image.png'));

  // Also copy to public/images/og-image.png
  fs.copyFileSync(
    path.join(process.cwd(), 'app', 'opengraph-image.png'),
    path.join(process.cwd(), 'public', 'images', 'og-image.png')
  );

  console.log('OpenGraph images (app/opengraph-image.png and public/images/og-image.png) created successfully.');
}

run().catch(console.error);
