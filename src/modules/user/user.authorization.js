import { roleEnum } from "../../DB/models/User.model.js";

export const endPoint = {
  profile: [roleEnum.admin, roleEnum.user],          // أي يوزر أو أدمن يقدر يشوف البروفايل
  updateUser: [roleEnum.user, roleEnum.admin],       // تعديل بيانات الحساب
  updatePassword: [roleEnum.user, roleEnum.admin],   // تغيير الباسورد
  freezeAccount: [roleEnum.user, roleEnum.admin],    // يوزر يقدر يجمد حسابه بنفسه
  restoreAccount: [roleEnum.admin],                  // بس الأدمن يعمل Restore
  deleteAccount: [roleEnum.admin],                   // بس الأدمن يعمل Delete
  logout: [roleEnum.user, roleEnum.admin],           // أي يوزر أو أدمن يقدر يعمل لوج أوت
};