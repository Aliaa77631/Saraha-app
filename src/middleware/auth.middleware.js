// src/middleware/auth.middleware.js
import { asyncHandler } from "../utils/response.js";
import { decodedToken, tokenKind } from "../utils/security/token.security.js";

/**
 * ✅ authentication middleware
 * - يتحقق من التوكن
 * - يضيف req.user و req.decoded
 * - ما يشيكش على الصلاحيات (roles)
 */
export const authentication = ({ tokenType = tokenKind.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
        next,
      })) || {};

    if (!user) {
      return next(new Error("Authentication failed", { cause: 401 }));
    }

    req.user = user;
    req.decoded = decoded;
    return next();
  });
};

/**
 * ✅ authorization middleware
 * - يشيك على دور (role) اليوزر
 * - لازم يكون عندك req.user جاهز (يعني استخدمه بعد authentication)
 */
export const authorization = ({ accessRole = [] } = {}) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !accessRole.includes(req.user.role)) {
      return next(new Error("Not authorized account", { cause: 403 }));
    }
    return next();
  });
};

/**
 * ✅ auth middleware (دمج بين الاتنين)
 * - يتحقق من التوكن
 * - يشيك على الدور
 */
export const auth = ({
  tokenType = tokenKind.access,
  accessRole = [],
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
        next,
      })) || {};

    if (!user) {
      return next(new Error("Authentication failed", { cause: 401 }));
    }

    req.user = user;
    req.decoded = decoded;

    if (accessRole.length && !accessRole.includes(req.user.role)) {
      return next(new Error("Not authorized account", { cause: 403 }));
    }

    return next();
  });
};