// src/modules/message/message.service.js
import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../DB/db.service.js";
import { userModel } from "../../DB/models/User.model.js";
import { MessageModel } from "../../DB/models/Message.models.js";
import fs from "fs";

// ================== Send Message ==================
export const sendMessage = asyncHandler(async (req, res, next) => {
  if (!req.body.content && (!req.files || req.files.length === 0)) {
    return next(new Error("Message content or attachments are required", { cause: 400 }));
  }

  const { receiverId } = req.params;

  const receiver = await DBService.findOne({
    model: userModel,
    filter: { _id: receiverId, deletedAt: { $exists: false }, confirmEmail: { $exists: true } },
  });

  if (!receiver) return next(new Error("Invalid recipient account", { cause: 404 }));

  const attachments = req.files?.map(f => ({ path: f.path, filename: f.filename })) || [];

  const [message] = await DBService.create({
    model: MessageModel,
    data: [{ content: req.body.content, attachments, receiverId, senderId: req.user._id }],
  });

  return successResponse({ res, status: 201, data: { message } });
});

// ================== Soft Delete Message ==================
export const softDeleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await DBService.findOneAndUpdate({
    model: MessageModel,
    filter: { _id: messageId, deletedAt: null },
    data: { deletedAt: new Date() },
    options: { new: true },
  });

  if (!message) return next(new Error("Message not found or already deleted", { cause: 404 }));

  return successResponse({ res, data: { message } });
});

// ================== Hard Delete Message ==================
export const hardDeleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await DBService.findOne({
    model: MessageModel,
    filter: { _id: messageId },
  });

  if (!message) return next(new Error("Message not found", { cause: 404 }));

  // حذف الملفات المرفقة من السيرفر
  if (message.attachments?.length) {
    message.attachments.forEach(file => {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
  }

  await DBService.deleteOne({ model: MessageModel, filter: { _id: messageId } });

  return successResponse({ res, message: "Message deleted permanently" });
});