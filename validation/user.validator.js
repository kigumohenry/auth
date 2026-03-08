const { z } = require("zod");

exports.updateUserProfileSchema = z.object({
  name: z.string().min(3),
});

exports.updateRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});
