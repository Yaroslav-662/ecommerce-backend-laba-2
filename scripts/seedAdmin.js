import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import User from "../src/models/User.js";
import Token from "../src/models/Token.js";
import { generateAccessToken, generateRefreshToken } from "../src/utils/generateToken.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = "admin@beautystore.com";
    const existingAdmin = await User.findOne({ email });

    // Якщо адмін існує — виводимо все і завершуємо
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      console.log("-------------------------------------");
      console.log(`👤 Name: ${existingAdmin.name}`);
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`🧩 2FA Enabled: ${existingAdmin.twoFactor?.enabled}`);
      
      // 🔥 Генеруємо нові токени навіть якщо адмін існує
      const token = generateAccessToken(existingAdmin);
      const refresh = generateRefreshToken(existingAdmin);

      await Token.create({
        token: refresh,
        user: existingAdmin._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      console.log("🔑 Access Token:", token);
      console.log("🔄 Refresh Token:", refresh);
      console.log("-------------------------------------");

      console.log("📱 You can log in immediately using these tokens.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    // 🔐 Генеруємо 2FA секрет
    const secret = speakeasy.generateSecret({
      name: "BeautyStore (Admin)",
      length: 20,
    });

    const admin = new User({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
      twoFactor: {
        secret: secret.base32,
        enabled: true,
      },
    });

    await admin.save();

    // 🖼️ QR-код
    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    // ⚡ Генеруємо JWT токени
    const token = generateAccessToken(admin);
    const refresh = generateRefreshToken(admin);

    await Token.create({
      token: refresh,
      user: admin._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    console.log("✅ Admin user created successfully!");
    console.log("-------------------------------------");
    console.log(`👤 Name: ${admin.name}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: Admin123!`);

    console.log(`🧩 2FA Secret: ${secret.base32}`);
    console.log("📸 Scan QR in Google Authenticator:\n");
    console.log(qrCodeDataURL);

    console.log("-------------------------------------");
    console.log("🔑 ACCESS TOKEN:\n", token);
    console.log("-------------------------------------");
    console.log("🔄 REFRESH TOKEN:\n", refresh);
    console.log("-------------------------------------");

    console.log("🚀 You can use the access token in Swagger → Authorize");
    console.log("🎉 Admin is fully ready for login!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
