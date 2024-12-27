import { z } from "zod"

export const AuthFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." })
        .max(20, { message: "Password must be at most 20 characters long." })
        .refine(
            (val) => /[A-Z]/.test(val),
            { message: "Password must contain at least one uppercase letter." }
        )
        .refine(
            (val) => /[a-z]/.test(val),
            { message: "Password must contain at least one lowercase letter." }
        )
        .refine(
            (val) => /[0-9]/.test(val),
            { message: "Password must contain at least one number." }
        )
        .refine(
            (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
            { message: "Password must contain at least one special character." }
        )
})

export type AuthForm = z.infer<typeof AuthFormSchema>
