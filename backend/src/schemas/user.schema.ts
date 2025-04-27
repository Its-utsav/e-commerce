import { z } from "zod";

const userZodSchema = z.object({
    username: z.string({
        message: "Username must be required",
    }),
    avatarUrl: z.string().optional(),
    email: z.string().email(),
    password: z.string(),
    address: z.string().optional(),
    refreshToken: z.string().jwt().optional(),
    role: z.enum(["ADMIN", "USER", "MERCHANTS"]).optional().default("USER"),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

export type userZodtype = z.infer<typeof userZodSchema>;
