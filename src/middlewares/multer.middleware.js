import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.gif') {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
});
