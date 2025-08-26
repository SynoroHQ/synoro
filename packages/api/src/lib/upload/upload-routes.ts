import express from "express";
import multer from "multer";
import { z } from "zod";

import { uploadField, uploadMultiple, uploadSingle } from "./multer-config";

const uploadRouter = express.Router();

// Validation schema for file metadata
const fileMetadataSchema = z.object({
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

// Single file upload
uploadRouter.post("/single", uploadSingle, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "NoFileUploaded",
        message: "No file was uploaded",
      });
    }

    // Parse additional form fields
    const metadata = fileMetadataSchema.parse(req.body);

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      metadata,
    };

    // Here you would typically save file metadata to database
    // and return a file ID or URL that can be used in tRPC procedures

    res.json({
      success: true,
      file: fileInfo,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      error: "UploadError",
      message: "Failed to process uploaded file",
    });
  }
});

// Multiple files upload
uploadRouter.post("/multiple", uploadMultiple, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "NoFilesUploaded",
        message: "No files were uploaded",
      });
    }

    const files = (req.files as Express.Multer.File[]).map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    }));

    // Parse additional form fields
    const metadata = fileMetadataSchema.parse(req.body);

    res.json({
      success: true,
      files,
      metadata,
      message: `${files.length} files uploaded successfully`,
    });
  } catch (error) {
    console.error("Multiple files upload error:", error);
    res.status(500).json({
      error: "UploadError",
      message: "Failed to process uploaded files",
    });
  }
});

// Specific fields upload (e.g., avatar + documents)
uploadRouter.post("/fields", uploadField, (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({
        error: "NoFilesUploaded",
        message: "No files were uploaded",
      });
    }

    const result: Record<string, any> = {};

    for (const [fieldName, fieldFiles] of Object.entries(files)) {
      result[fieldName] = fieldFiles.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      }));
    }

    // Parse additional form fields
    const metadata = fileMetadataSchema.parse(req.body);

    res.json({
      success: true,
      files: result,
      metadata,
      message: "Files uploaded successfully",
    });
  } catch (error) {
    console.error("Fields upload error:", error);
    res.status(500).json({
      error: "UploadError",
      message: "Failed to process uploaded files",
    });
  }
});

// Error handling middleware for multer errors
uploadRouter.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "FileTooLarge",
          message: "File size exceeds the limit of 50MB",
        });
      }
      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(413).json({
          error: "TooManyFiles",
          message: "Too many files uploaded",
        });
      }
      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          error: "UnexpectedFile",
          message: "Unexpected file field",
        });
      }
    }

    if (error.message && error.message.includes("File type")) {
      return res.status(400).json({
        error: "InvalidFileType",
        message: error.message,
      });
    }

    console.error("Upload route error:", error);
    res.status(500).json({
      error: "UploadError",
      message: "Internal server error during file upload",
    });
  },
);

export { uploadRouter };
