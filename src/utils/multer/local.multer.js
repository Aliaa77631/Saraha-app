// src/utils/multer/local.multer.js
import multer from "multer";
import path from "node:path";
import fs from "fs";

// helper لإنشاء فولدر لو مش موجود
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// فولدر للـ profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads/profile");
    ensureDirExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// فولدر للـ cover images
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads/cover");
    ensureDirExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// فولدر للـ message attachments
const messageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads/messages");
    ensureDirExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/jpg", "image/gif"],
};

const filterImages = (req, file, cb) => {
  if (fileValidation.image.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

// exports
export const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter: filterImages,
});

export const uploadCoverImages = multer({
  storage: coverStorage,
  fileFilter: filterImages,
});

export const uploadMessageAttachments = multer({
  storage: messageStorage,
  fileFilter: filterImages,
});