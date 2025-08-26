import path from "path";
import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // You can customize the upload directory based on your needs
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueName = `${nanoid()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Add file type validation if needed
    // Example: only allow images and documents
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

export function setupUploadRoutes(app: express.Application) {
  // Single file upload
  app.post("/api/upload/single", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          message: "Please provide a file in the 'file' field",
        });
      }

      res.json({
        success: true,
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path,
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        error: "Upload failed",
        message: "An error occurred during file upload",
      });
    }
  });

  // Multiple files upload
  app.post("/api/upload/multiple", upload.array("files", 10), (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: "No files uploaded",
          message: "Please provide files in the 'files' field",
        });
      }

      const uploadedFiles = (req.files as Express.Multer.File[]).map(
        (file) => ({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: file.path,
        }),
      );

      res.json({
        success: true,
        files: uploadedFiles,
        count: uploadedFiles.length,
      });
    } catch (error) {
      console.error("Multiple files upload error:", error);
      res.status(500).json({
        error: "Upload failed",
        message: "An error occurred during files upload",
      });
    }
  });

  // Error handling middleware for multer
  app.use(
    (
      error: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            error: "File too large",
            message: "File size exceeds the 50MB limit",
          });
        }
        if (error.code === "LIMIT_FILE_COUNT") {
          return res.status(413).json({
            error: "Too many files",
            message: "Maximum 10 files allowed per request",
          });
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            error: "Unexpected file field",
            message: "Unexpected file field in the request",
          });
        }
      }

      if (error.message && error.message.includes("File type")) {
        return res.status(400).json({
          error: "Invalid file type",
          message: error.message,
        });
      }

      next(error);
    },
  );
}
