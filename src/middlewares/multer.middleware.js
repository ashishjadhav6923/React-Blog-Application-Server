import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/');
  },
  filename: function (req, file, cb) {
    // Extract the original name and extension
    const ext = path.extname(file.originalname); // Get the file extension
    const name = path.basename(file.originalname, ext); // Get the file name without extension

    // Create a new filename with a number before the extension
    const newFileName = `${name}-${Date.now()}${ext}`;

    cb(null, newFileName);
  }
});

export const upload = multer({ storage: storage });
