import fs from 'fs';
import path from 'path';

// Railway wipes a container's disk on every deploy unless a volume is attached,
// so without one the CMS database and uploads are erased by each deploy.
export const onRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID,
);
export const volumeMountPath = process.env.RAILWAY_VOLUME_MOUNT_PATH || '';
export const storageIsEphemeral = onRailway && !volumeMountPath;

// Where CMS uploads live: next to the database on the Railway volume (any mount
// path), /data if present, otherwise backend/uploads locally.
export const uploadsDir = volumeMountPath
  ? path.join(volumeMountPath, 'uploads')
  : fs.existsSync('/data') ? '/data/uploads' : path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Web-optimized copies of the photos in the hard-coded content snapshot. They ship
// with the app, so fleet and instructor photos survive even if the volume is lost.
export const bundledUploadsDir = path.join(__dirname, '../bundled-uploads');
