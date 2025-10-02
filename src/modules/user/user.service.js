import * as DBService from "../../DB/db.service.js";
import { TokenModel } from "../../DB/models/Token.model.js";
import { roleEnum, userModel } from "../../DB/models/User.model.js";
import fs from "fs";
import { asyncHandler, successResponse } from "../../utils/response.js";
import { decryptEncryption, generateEncryption } from "../../utils/security/encryption.security.js";
import { comparHash, generateHash } from "../../utils/security/hash.security.js";
import { createRevokeToken, getLoginCredentials, logoutEnum } from "../../utils/security/token.security.js";

// ================== logout ==================
export const logout = asyncHandler(async (req, res, next) => {
  let status = 200;
  const { flag } = req.body;
  if (flag === logoutEnum.signoutFromAll) {
    await DBService.updateOne({ model: userModel, filter: { _id: req.user._id }, data: { changeCredentialsTime: new Date() } });
  } else {
    await createRevokeToken({ req });
    status = 201;
  }
  return successResponse({ res, status, data: {} });
});

// ================== profile ==================
export const profile = asyncHandler(async (req, res, next) => {
  const user = await DBService.findById({ model: userModel, id: req.user._id, select: "-password", populate: [{ path: "messages" }] });
  if (!user) return next(new Error("User not found", { cause: 404 }));
  if (user.phone) user.phone = await decryptEncryption({ cipherText: user.phone });
  return successResponse({ res, data: { user } });
});

// ================== shareProfile ==================
export const shareProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBService.findOne({ model: userModel, filter: { _id: userId, confirmEmail: { $exists: true } }, select: "-password" });
  if (!user) return next(new Error("Invalid account", { cause: 404 }));
  return successResponse({ res, data: { user } });
});

// ================== getNewLoginCredentials ==================
export const getNewLoginCredentials = asyncHandler(async (req, res) => {
  const credentials = await getLoginCredentials({ user: req.user });
  return successResponse({ res, data: { credentials } });
});

// ================== updateUser ==================
export const updateUser = asyncHandler(async (req, res, next) => {
  const { fullName, phone, gender } = req.body;
  if (!fullName && !gender && !phone) return next(new Error("No data provided to update", { cause: 400 }));
  let updateData = {};
  if (fullName) {
    const [firstName, ...lastNameParts] = fullName.trim().split(" ");
    updateData.firstName = firstName;
    updateData.lastName = lastNameParts.join(" ");
  }
  if (gender) updateData.gender = gender;
  if (phone) updateData.phone = generateEncryption({ plainText: phone });
  const updatedUser = await DBService.findByIdAndUpdate({ model: userModel, id: req.user._id, data: updateData, select: "-password" });
  if (!updatedUser) return next(new Error("User not found", { cause: 404 }));
  return successResponse({ res, data: { user: updatedUser } });
});

// ================== updatePassword ==================
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password, flag } = req.body;
  const isValidOld = await comparHash({ plainText: oldPassword, hashValue: req.user.password });
  if (!isValidOld) return next(new Error("Invalid old password", { cause: 400 }));
  if (req.user.oldPasswords?.length) {
    const isUsedBefore = await Promise.all(req.user.oldPasswords.map(hashPassword =>
      comparHash({ plainText: password, hashValue: hashPassword })
    ));
    if (isUsedBefore.includes(true)) return next(new Error("This password was used before", { cause: 400 }));
  }
  let updateData = {};
  if (flag === logoutEnum.signoutFromAll) updateData.changeCredentialsTime = new Date();
  else if (flag === logoutEnum.signout) await createRevokeToken({ req });
  const updatedUser = await DBService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    data: { password: await generateHash({ plainText: password }), ...updateData, $push: { oldPasswords: req.user.password } },
    select: "-password"
  });
  if (!updatedUser) return next(new Error("User not found", { cause: 404 }));
  return successResponse({ res, data: { user: updatedUser } });
});

// ================== freezeAccount ==================
export const freezeAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (userId && req.user.role !== roleEnum.admin) return next(new Error("Not authorized", { cause: 403 }));
  const User = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { _id: userId || req.user._id, deletedAt: { $exists: false } },
    data: { deletedAt: Date.now(), deletedBy: req.user._id, changeCredentialsTime: new Date(), $unset: { restoreAt: 1, restoreBy: 1 } },
    select: "-password"
  });
  if (!User) return next(new Error("User not found", { cause: 404 }));
  return successResponse({ res, data: { user: User } });
});

// ================== deleteAccount ==================
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const User = await DBService.deleteOne({ model: userModel, filter: { _id: userId, deletedAt: { $exists: true } } });
  if (!User.deletedCount) return next(new Error("User not found", { cause: 404 }));
  return successResponse({ res, data: { user: User } });
});

// ================== restoreAccount ==================
export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const User = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { _id: userId, deletedAt: { $exists: true } },
    data: { $unset: { deletedAt: 1, deletedBy: 1 }, restoreAt: Date.now(), restoreBy: req.user._id },
    select: "-password"
  });
  if (!User) return next(new Error("User not found", { cause: 404 }));
  return successResponse({ res, data: { user: User } });
});

// ================== profileImage ==================
export const profileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("No file uploaded", { cause: 400 }));
  const filePath = req.file.path;
  const user = await DBService.findOneAndUpdate({ model: userModel, filter: { _id: req.user._id }, data: { picture: { path: filePath } }, select: "-password" });
  if (user?.picture?.path && user.picture.path !== filePath) fs.unlink(user.picture.path, err => { if (err) console.log("Failed to delete old profile image:", err); });
  return successResponse({ res, data: { user } });
});

// ================== profileCoverImage ==================
export const profileCoverImage = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next(new Error("No files uploaded", { cause: 400 }));
  const coverObjects = req.files.map(f => ({ path: f.path, filename: f.filename }));
  const user = await DBService.findOneAndUpdate({ model: userModel, filter: { _id: req.user._id }, data: { cover: coverObjects }, select: "-password" });
  if (user?.cover?.length) {
    user.cover.forEach(oldFile => {
      if (oldFile?.path && !coverObjects.find(f => f.path === oldFile.path)) fs.unlink(oldFile.path, err => { if (err) console.log("Failed to delete old cover image:", err); });
    });
  }
  return successResponse({ res, data: { user } });
});