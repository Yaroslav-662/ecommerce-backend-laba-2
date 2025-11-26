import bcrypt from "bcryptjs";
export const hashPassword = async (pw) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
};
export const comparePasswords = async (pw, hash) => bcrypt.compare(pw, hash);
