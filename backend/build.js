import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildLambda() {
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  console.log('📦 Bundling Runway 2027 AWS Lambda handler with esbuild...');

  // 1. Bundle with esbuild into index.mjs
  const outfile = path.join(distDir, 'index.mjs');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src', 'index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile,
    external: ['@aws-sdk/*'], // AWS SDK v3 is natively built into AWS Lambda Node 20 runtime
    minify: true,
    sourcemap: false,
    banner: {
      js: '// Runway 2027 AWS Lambda Serverless API\n',
    },
  });

  console.log('✅ esbuild bundle completed: dist/index.mjs');

  // 2. Package into lambda.zip
  const zip = new AdmZip();
  zip.addLocalFile(outfile);
  const zipPath = path.join(distDir, 'lambda.zip');
  zip.writeZip(zipPath);

  const stats = fs.statSync(zipPath);
  const sizeKb = (stats.size / 1024).toFixed(1);

  console.log(`🚀 Created standalone AWS Lambda package: dist/lambda.zip (${sizeKb} KB)`);
  console.log('⚡ Handler in AWS Lambda Console: index.handler');
  console.log('⚡ Runtime in AWS Lambda Console: Node.js 20.x or 22.x');
}

buildLambda().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
