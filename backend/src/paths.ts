import fs from 'fs';
import path from 'path';

// Where CMS uploads live: the Railway volume in production, backend/uploads locally.
export const uploadsDir = fs.existsSync('/data') ? '/data/uploads' : path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Web-optimized copies of the photos in the hard-coded content snapshot. They ship
// with the app, so fleet and instructor photos survive even if the volume is lost.
export const bundledUploadsDir = path.join(__dirname, '../bundled-uploads');
