import joi from "joi";
import { generaleFields } from "../../middleware/validation.middleware.js";
import { logoutEnum } from "../../utils/security/token.security.js";
import { fileValidation } from "../../utils/multer/local.multer.js";

// ================== logout ==================
export const logout = {
  body: joi
    .object()
    .keys({
      flag: joi
        .string()
        .valid(...Object.values(logoutEnum))
        .default(logoutEnum.stayLoggedIn),
    })
    .required(),
};

// ================== shareProfile ==================
export const shareProfile = {
  params: joi.object().keys({
    userId: generaleFields.id.required(),
  }),
};

// ================== updateBasicInfo ==================
export const updateBasicInfo = {
  body: joi
    .object()
    .keys({
      fullName: generaleFields.fullName,
      phone: generaleFields.phone,
      gender: generaleFields.gender,
    })
    .required(),
};

// ================== updatePassword ==================
export const updatePassword = {
  body: logout.body
    .append({
      oldPassword: generaleFields.password.required(),
      password: generaleFields.password.not(joi.ref("oldPassword")).required(),
      confirmPassword: generaleFields.confirmPassword.required(),
    })
    .required(),
};

// ================== freezeAccount ==================
export const freezeAccount = {
  params: joi.object().keys({
    userId: generaleFields.id,
  }),
};

// ================== restoreAccount ==================
export const restoreAccount = {
  params: joi.object().keys({
    userId: generaleFields.id.required(),
  }),
};

// ================== deleteAccount ==================
export const deleteAccount = {
  params: joi.object().keys({
    userId: generaleFields.id.required(),
  }),
};

// ================== profileImage ==================
export const profileImage = {
  file: generaleFields.file.keys({
    fieldname: joi.string().valid("image").required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().valid(...fileValidation.image).required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
    size: joi.number().required(),
  }),
};

// ================== profileCoverImage ==================
export const profileCoverImage = {
  files: joi
    .array()
    .items(
      generaleFields.file.keys({
        fieldname: joi.string().valid("images").required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().valid(...fileValidation.image).required(),
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        size: joi.number().required(),
      })
    )
    .min(1)
    .max(2)
    .required(),
};