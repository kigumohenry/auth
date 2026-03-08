const { z } = require("zod");

exports.registerSchema = z.object({
  name: z.string().min(3, "name must be atleast 3 characters long"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be atleast 8 characters long"),
});

exports.loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8),
});
