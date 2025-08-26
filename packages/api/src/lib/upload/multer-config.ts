import path from "path";
import multer from "multer";

// Configure multer for file uploads
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // You can customize the upload directory based on file type or other criteria
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      // Generate unique filename with original extension
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
      );
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types for security
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

// Single file upload middleware
export const uploadSingle = upload.single("file");

// Multiple files upload middleware
export const uploadMultiple = upload.array("files", 10);

// Specific field upload middleware
export const uploadField = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "documents", maxCount: 5 },
]);
