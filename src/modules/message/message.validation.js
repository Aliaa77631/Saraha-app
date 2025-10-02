// src/modules/message/message.validation.js
import joi from "joi";
import { generaleFields } from "../../middleware/validation.middleware.js";
import { fileValidation } from "../../utils/multer/local.multer.js";

export const sendMessage = {
  params: joi.object({
    receiverId: generaleFields.id.required(),
  }),
  body: joi.object({
    content: joi.string().min(2).max(200000),
  }),
  files: joi.array().items(
    generaleFields.file.keys({
      fieldname: joi.string().valid("attachments").required(),
      mimetype: joi.string().valid(...fileValidation.image).required(),
      originalname: generaleFields.file.extract("originalname").required(),
      encoding: generaleFields.file.extract("encoding").required(),
      destination: generaleFields.file.extract("destination").required(),
      filename: generaleFields.file.extract("filename").required(),
      path: generaleFields.file.extract("path").required(),
      size: generaleFields.file.extract("size").required(),
    })
  ).min(0).max(2),
};