import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const fullPath = path.join(__dirname, '..', 'uploads', uploadPath);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  });
};

// General file filter (for announcements - documents allowed)
const generalFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'));
  }
};

// Image-only file filter (for gallery, awards, members)
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const createUpload = (uploadPath, maxFiles = 5, filterType = 'general') => {
  const fileFilterToUse = filterType === 'image' ? imageFileFilter : generalFileFilter;
  
  return multer({
    storage: createStorage(uploadPath),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: fileFilterToUse
  }).array('files', maxFiles);
};

// Export different upload middlewares
export const announcementUpload = createUpload('announcements', 5, 'general'); // Allow documents
export const galleryUpload = createUpload('gallery', 1, 'image'); // Only images
export const awardUpload = createUpload('awards', 1, 'image'); // Only images  
export const memberUpload = createUpload('members', 1, 'image'); // Only images
