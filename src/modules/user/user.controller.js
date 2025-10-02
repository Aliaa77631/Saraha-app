// src/modules/user/user.router.js
import { Router } from "express";
import {
  deleteAccount,
  freezeAccount,
  getNewLoginCredentials,
  logout,
  profile,
  profileCoverImage,
  profileImage,
  restoreAccount,
  shareProfile,
  updatePassword,
  updateUser,
} from "./user.service.js";

import { auth, authentication } from "../../middleware/auth.middleware.js";
import { tokenKind } from "../../utils/security/token.security.js";
import { endPoint } from "./user.authorization.js";
import * as validators from "./user.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { uploadProfileImage, uploadCoverImages } from "../../utils/multer/local.multer.js";

const router = Router();

// ================== Logout ==================
router.post(
  "/logout",
  auth({ accessRole: endPoint.logout }),
  validation(validators.logout),
  logout
);

// ================== Profile ==================
router.get("/", auth({ accessRole: endPoint.profile }), profile);

// ================== Refresh Token ==================
router.get(
  "/refresh-token",
  authentication({ tokenType: tokenKind.refresh }),
  getNewLoginCredentials
);

// ================== Share Profile (Public) ==================
router.get("/:userId", validation(validators.shareProfile), shareProfile);

// ================== Update Basic Info ==================
router.patch(
  "/update",
  auth({ accessRole: endPoint.updateUser }),
  validation(validators.updateBasicInfo),
  updateUser
);

// ================== Freeze Account ==================
router.delete(
  "/:userId/freeze-account",
  auth({ accessRole: endPoint.freezeAccount }),
  validation(validators.freezeAccount),
  freezeAccount
);

// ================== Restore Account ==================
router.patch(
  "/:userId/restore-account",
  auth({ accessRole: endPoint.restoreAccount }),
  validation(validators.restoreAccount),
  restoreAccount
);

// ================== Update Password ==================
router.patch(
  "/password",
  auth({ accessRole: endPoint.updatePassword }),
  validation(validators.updatePassword),
  updatePassword
);

// ================== Update Profile Image ==================
router.patch(
  "/profile-image",
  auth({ accessRole: endPoint.updateUser }),
  uploadProfileImage.single("image"),
  profileImage
);

// ================== Update Profile Cover Images ==================
router.patch(
  "/profile-cover-images",
  auth({ accessRole: endPoint.updateUser }),
  uploadCoverImages.array("images", 2),
  profileCoverImage
);

// ================== Delete Account (Admin Only) ==================
router.delete(
  "/:userId",
  auth({ accessRole: endPoint.deleteAccount }),
  validation(validators.deleteAccount),
  deleteAccount
);

export default router;