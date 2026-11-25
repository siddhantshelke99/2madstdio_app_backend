#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecrets(options = {}) {
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  const apiSecretKey = crypto.randomBytes(32).toString('hex');

  console.log('\n=========================================');
  console.log('  2NOMADS CRYPTOGRAPHIC SECRETS GENERATOR');
  console.log('=========================================\n');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`SESSION_SECRET=${sessionSecret}`);
  console.log(`API_SECRET_KEY=${apiSecretKey}\n`);
  console.log('Format: Cryptographically secure hex (Node crypto.randomBytes)');

  if (process.argv.includes('--update-env')) {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      
      if (/^JWT_SECRET=.*/m.test(content)) {
        content = content.replace(/^JWT_SECRET=.*/m, `JWT_SECRET=${jwtSecret}`);
      } else {
        content += `\nJWT_SECRET=${jwtSecret}`;
      }

      if (/^SESSION_SECRET=.*/m.test(content)) {
        content = content.replace(/^SESSION_SECRET=.*/m, `SESSION_SECRET=${sessionSecret}`);
      } else {
        content += `\nSESSION_SECRET=${sessionSecret}`;
      }

      if (/^API_SECRET_KEY=.*/m.test(content)) {
        content = content.replace(/^API_SECRET_KEY=.*/m, `API_SECRET_KEY=${apiSecretKey}`);
      } else {
        content += `\nAPI_SECRET_KEY=${apiSecretKey}`;
      }

      fs.writeFileSync(envPath, content, 'utf8');
      console.log(' Successfully updated backend/.env with fresh secrets!\n');
    }
  }
}

generateSecrets();
