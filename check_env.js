
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    if (envConfig.includes('DATABASE_URL=')) {
        console.log('DATABASE_URL found in .env.local');
    } else {
        console.log('DATABASE_URL NOT found in .env.local');
    }
} else {
    console.log('.env.local not found');
}
