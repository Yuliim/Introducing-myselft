import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
const [endpoint, apiKey] = process.argv.slice(2);
if (!/^https:\/\/[a-z0-9]+\.appsync-api\.[a-z0-9-]+\.amazonaws\.com\/graphql$/.test(endpoint || '') || !/^[A-Za-z0-9_-]+$/.test(apiKey || '')) {
  throw new Error('Usage: node scripts/configure-guestbook.mjs <AppSync HTTPS endpoint> <public browser API key>');
}
const context = { window: {} };
vm.runInNewContext(await readFile('web/config.js', 'utf8'), context);
const config = { ...context.window.APP_CONFIG, graphqlEndpoint: endpoint, apiKey };
await writeFile('web/config.js', `// AppSync browser API key is public and expires; never put AWS IAM credentials here.\nwindow.APP_CONFIG = ${JSON.stringify(config, null, 2)};\n`);
console.log('Updated web/config.js. Upload app.js and config.js to the existing S3 bucket.');
