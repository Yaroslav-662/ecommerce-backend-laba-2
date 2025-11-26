import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * Універсальна функція для надсилання листів.
 * Працює як з Gmail, так і з тестовим SMTP (Ethereal).
 *
 * @param {Object} options
 * @param {string} options.to - Email отримувача
 * @param {string} options.subject - Тема листа
 * @param {string} [options.text] - Текст листа (plain text)
 * @param {string} [options.html] - HTML контент листа
 * @returns {Promise<string|object>} - URL для перегляду тестового листа або інформація про доставку
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // ✅ Використовуємо реальний поштовий сервіс (наприклад Gmail)
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // 🧪 Використовуємо тестову пошту (Ethereal)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"E-commerce Shop" <${process.env.EMAIL_USER || "no-reply@example.com"}>`,
      to,
      subject,
      text,
      html,
    });

    // 🧪 Якщо тестовий акаунт — повертаємо посилання на лист
    const previewUrl = process.env.EMAIL_USER
      ? info.response
      : nodemailer.getTestMessageUrl(info);

    console.log("📤 Email sent:", previewUrl);
    return previewUrl;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email could not be sent");
  }
}
