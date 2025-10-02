import { Router } from "express";
import * as messageService from "./message.service.js";
import * as validators from "./message.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { uploadMessageAttachments } from "../../utils/multer/local.multer.js";

const router = Router();

// إرسال رسالة إلى مستخدم
router.post(
  "/:receiverId",
  authentication(),
  uploadMessageAttachments.array("attachments", 2), // رفع حتى 2 مرفق
  validation(validators.sendMessage),
  messageService.sendMessage
);

// حذف الرسالة بشكل مؤقت (soft delete)
router.delete(
  "/:messageId/soft",
  authentication(),
  messageService.softDeleteMessage
);

// حذف الرسالة نهائيًا (hard delete)
router.delete(
  "/:messageId/hard",
  authentication(),
  messageService.hardDeleteMessage
);

export default router;