// src/middleware/adminMiddleware.js

/**
 * Middleware: дозволяє доступ лише адміністраторам
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied: admin only" });
};

/**
 * Middleware: дозволяє доступ або адміну, або власнику ресурсу (автору)
 * Використовується для Reviews, Orders тощо
 */
export const isAdminOrAuthor = (model) => {
  return async (req, res, next) => {
    try {
      if (req.user.role === "admin") return next();

      const resource = await model.findById(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      if (resource.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
