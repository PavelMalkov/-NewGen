const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_PATH || './uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(path.join(uploadDir, 'videos'))) {
  fs.mkdirSync(path.join(uploadDir, 'videos'), { recursive: true });
}

if (!fs.existsSync(path.join(uploadDir, 'thumbnails'))) {
  fs.mkdirSync(path.join(uploadDir, 'thumbnails'), { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, path.join(uploadDir, 'videos'));
    } else if (file.fieldname === 'thumbnail') {
      cb(null, path.join(uploadDir, 'thumbnails'));
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowedVideoTypes = /mp4|avi|mkv|mov|webm/;
    const extname = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedVideoTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  } else if (file.fieldname === 'thumbnail') {
    const allowedImageTypes = /jpeg|jpg|png|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails!'));
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 * 1024
  },
  fileFilter: fileFilter
});

module.exports = upload;
