import { z } from "zod";

export const createUserZodSchema = z.object({
    username: z
        .string({
            message: "Username must be required",
            invalid_type_error: "Username must be string",
        })
        .toLowerCase()
        .trim(),

    email: z
        .string({
            required_error: "Email must be required",
            invalid_type_error: "Email must be string",
        })
        .email(),
    password: z
        .string({
            required_error: "Password must be required",
            invalid_type_error:
                "Password should be combination for character and numbers",
        })
        .min(8, "Password must be at least 8 characters long"),
    address: z.string().optional(),
    role: z.enum(["ADMIN", "USER", "MERCHANT"]).optional().default("USER"),
});

export type createUser = z.infer<typeof createUserZodSchema>;

export const loginUserZodSchema = z.object({
    email: z
        .string({
            required_error: "Email must be required",
            invalid_type_error: "Email must be string",
        })
        .email(),
    password: z
        .string({
            required_error: "Password must be required",
            invalid_type_error:
                "Password should be combination for character and numbers",
        })
        .min(8, "Password must be at least 8 characters long"),
});

export type loginUser = z.infer<typeof loginUserZodSchema>;

export const updateUserZodSchema = z.object({
    address: z
        .string({
            invalid_type_error: "address must contains character and numbers",
        })
        .optional(),
});

export type updatedUser = z.infer<typeof updateUserZodSchema>;

export const updatePasswordZodSchema = z.object({
    oldPassword: z.string({
        required_error: "Old password is required",
    }),
    newPassword: z.string({
        required_error: "New password is required",
    }),
});

export type updatePassword = z.infer<typeof updatePasswordZodSchema>;

export const updateUserRoleZodSchema = z.object({
    role: z.enum(["ADMIN", "USER", "MERCHANT"], {
        required_error: "Update user role is required",
        invalid_type_error: "Role must be string",
    }),
});
export type updateRoleType = z.infer<typeof updateUserRoleZodSchema>;
