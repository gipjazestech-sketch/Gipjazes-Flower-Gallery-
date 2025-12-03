const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log('Created uploads directory:', dir);
} else {
  console.log('Uploads directory already exists:', dir);
}

process.exit(0);
