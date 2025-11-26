// src/config/swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const router = express.Router();

// Налаштування Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API електронної комерції 💄",
      version: "1.0.0",
      description:
        "Документація REST API для онлайн-магазину косметики. Використовує JWT авторизацію.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Локальний сервер",
      },
      // Якщо є продакшн сервер, можна додати:
      // {
      //   url: "http://api.myshop.com",
      //   description: "Продакшн сервер",
      // },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Шлях до файлів із документацією маршрутів
  apis: ["./src/routes/*.js"],
};

// Створюємо специфікацію Swagger
const swaggerSpec = swaggerJsdoc(options);

// Підключення Swagger UI
router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

console.log("📘 Swagger Docs available at /api/docs");

export default router;
