import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { phoneNumber } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendAuthOtp } from "@/features/auth/server/whatsapp-otp";

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[\s()-]/g, "");
}

function tempEmailFromPhone(phoneNumber: string) {
  const digits = normalizePhoneNumber(phoneNumber).replace(/[^\d+]/g, "");
  return `wa-${digits}@phone.mandaozi.local`;
}

export const auth = betterAuth({
  appName: "Mandaozi",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
    usePlural: true,
  }),
  plugins: [
    nextCookies(),
    phoneNumber({
      requireVerification: true,
      phoneNumberValidator: (phoneNumber) =>
        /^\+[1-9]\d{7,14}$/.test(normalizePhoneNumber(phoneNumber)),
      sendOTP: async ({ phoneNumber, code }) => {
        await sendAuthOtp({
          phoneNumber: normalizePhoneNumber(phoneNumber),
          code,
        });
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => tempEmailFromPhone(phoneNumber),
        getTempName: (phoneNumber) => normalizePhoneNumber(phoneNumber),
      },
    }),
  ],
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
