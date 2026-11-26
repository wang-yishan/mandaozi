import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .min(8, "Nomor HP wajib diisi")
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine(
    (value) => /^\+[1-9]\d{7,14}$/.test(value),
    "Gunakan format internasional, contoh: +6281234567890",
  );

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(128, "Password maksimal 128 karakter");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter")
  .max(80, "Nama maksimal 80 karakter");

export const loginSchema = z.object({
  phoneNumber: phoneSchema,
  password: passwordSchema,
  rememberMe: z.boolean(),
});

export const signupSchema = z
  .object({
    name: nameSchema,
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  phoneNumber: phoneSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Kode OTP harus 6 digit"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type OtpInput = z.infer<typeof otpSchema>;