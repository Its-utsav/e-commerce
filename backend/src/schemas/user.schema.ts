import { z } from "zod";

export const createUserZodSchema = z.object({
    username: z.string({
        message: "Username must be required",
    }),
    avatarUrl: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    address: z.string().optional(),
    role: z.enum(["ADMIN", "USER", "MERCHANT"]).optional().default("USER"),
});

export type userZodtype = z.infer<typeof createUserZodSchema>;
