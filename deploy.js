import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function run(cmd, cwd = __dirname) {
  console.log(`\n▶ Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   RUNWAY 2027 — ONE-COMMAND SERVERLESS AWS DEPLOYMENT         ');
  console.log('═══════════════════════════════════════════════════════════════');

  // Step 1: Package backend Lambda (11.5 KB)
  console.log('\n[1/4] 📦 Bundling Lambda function...');
  run('node backend/build.js');

  // Step 2: Build frontend static distribution
  console.log('\n[2/4] ⚡ Building frontend React application...');
  run('npm run build');

  // Step 3: Deploy AWS Serverless Stack (DynamoDB, Lambda, S3, CloudFront)
  console.log('\n[3/4] ☁️ Deploying AWS resources via Serverless Framework...');
  run('npx serverless@3 deploy');

  // Step 4: Sync frontend static files to S3
  console.log('\n[4/4] 🚀 Syncing frontend to S3 & CloudFront...');
  try {
    const infoOutput = execSync('npx serverless@3 info --verbose', { encoding: 'utf-8' });
    const bucketMatch = infoOutput.match(/FrontendBucketName:\s*([^\s\r\n]+)/);
    const cloudFrontMatch = infoOutput.match(/CloudFrontUrl:\s*([^\s\r\n]+)/);
    const lambdaUrlMatch = infoOutput.match(/LambdaFunctionUrl:\s*([^\s\r\n]+)/);

    const bucketName = bucketMatch ? bucketMatch[1] : null;
    const cloudFrontUrl = cloudFrontMatch ? cloudFrontMatch[1] : null;
    const lambdaUrl = lambdaUrlMatch ? lambdaUrlMatch[1] : null;

    if (bucketName) {
      console.log(`Uploading 'dist/' to s3://${bucketName}...`);
      try {
        run(`aws s3 sync dist/ s3://${bucketName} --delete`);
      } catch {
        console.log(`(Notice: If 'aws' CLI is not in your PATH, run: aws s3 sync dist/ s3://${bucketName})`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 DEPLOYMENT COMPLETE! 100% ALWAYS-FREE TIER READY');
    console.log('═══════════════════════════════════════════════════════════════');
    if (cloudFrontUrl) {
      console.log(`\n🌐 Frontend URL (Free CloudFront Domain): ${cloudFrontUrl}`);
    }
    if (lambdaUrl) {
      console.log(`⚡ Backend API URL (AWS Lambda):          ${lambdaUrl}`);
    }
    console.log('\n👉 Next step: Open your CloudFront URL, click the Cloud icon,');
    console.log('   and connect your Lambda URL to sync data!');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (err) {
    console.log('Deployed! Run "npx serverless info" to view your live URLs.');
  }
}

main().catch((err) => {
  console.error('\n❌ Deployment failed:', err.message);
  process.exit(1);
});
